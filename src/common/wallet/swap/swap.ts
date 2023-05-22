import { BigNumber } from "@ethersproject/bignumber";
import { formatEther, parseUnits } from "@ethersproject/units";

import { ETH_ADDRESS } from "common/config";
import { AccountInfo, BlockchainNetwork, RawTransaction, TransactionRequest } from "common/types";
import { EVMFeeStrategy, MINIMUM_GAS_LIMIT } from "ui/common/fee";

import { EIP1559FeeManager } from "ui/common/fee/evm/EIP1559";
import { changeByPercentage } from "ui/common/fee/evm/utils";
import { getEVMTransactionService } from "common/transactions";
import { GasOptions, GasPresetSettings, TokenDisplayWithTicker, TokenSwapDetails } from "ui/types";

import { ForwardingSwapProxy__factory } from "../typechain/factories/ForwardingSwapProxy__factory";

import { getApprovalManager } from "./allowance";
import {
  calculateMinimumReturnAmount,
  getAddress,
  validateGasRefund,
  getOneInchSwapParams,
  getRequiredGasRefund,
  getSimulationGasLimit,
} from "./helpers";

import { Pair, ProxySwapParams, SwapManagerParams as ExchangeManagersParams, SwapParams } from "./types";

type EIP1559Fields = { maxPriorityFeePerGas?: string; baseFee?: string; gasLimit?: string };

function overrideEIP1559Fields(manager: EVMFeeStrategy, fields: EIP1559Fields) {
  if (fields.baseFee) {
    manager.changeBaseFee(fields.baseFee);
  }

  if (fields.maxPriorityFeePerGas) {
    manager.changeMaxPriorityFeePerGas(fields.maxPriorityFeePerGas);
  }

  if (fields.gasLimit) {
    manager.changeGasLimit(fields.gasLimit);
  }
}

function getSwapTransaction(params: ProxySwapParams): RawTransaction {
  const { accountAddress, swapContractAddress, swapParams, fromTokenAddress, toTokenAddress, minimumReturnAmount, gasRefund } = params;

  const contractInterface = ForwardingSwapProxy__factory.createInterface();

  const data = contractInterface.encodeFunctionData("proxySwapWithFee", [
    fromTokenAddress,
    toTokenAddress,
    swapParams,
    gasRefund,
    minimumReturnAmount,
  ]);

  const value = fromTokenAddress === ETH_ADDRESS ? BigNumber.from(swapParams.value).toHexString() : "0x0";

  return {
    from: accountAddress,
    to: swapContractAddress,
    data,
    value,
  };
}

export async function getExchangeManagers(params: ExchangeManagersParams) {
  const { tokens, amounts, slippage, swapContract, accountAddress, gasless, accountInfo, network, userBalance, gasPresets } = params;

  if (!tokens.from || !tokens.to) {
    throw new Error("Can not prepare 1inch request without swap from and swap to");
  }

  if (tokens.from.networkIdentifier !== tokens.to.networkIdentifier) {
    throw new Error("Tokens must be on the same network");
  }

  if (Number(amounts.from) === 0 || Number(amounts.to) === 0) {
    throw new Error("Can not prepare 1inch request with 0 amount");
  }

  if (!swapContract) {
    throw new Error("Did not resolve which swap contract is used");
  }

  if (!slippage) {
    throw new Error("Slippage is not provided");
  }

  const oneInchRequest = {
    swapFromAddress: getAddress(tokens.from),
    swapToAddress: getAddress(tokens.to),
    chainId: tokens.from.networkDefinition.chainId,
    destReceiver: swapContract,
    from: accountAddress,
    amount: parseUnits(amounts.from, tokens.from.decimals).toString(),
    slippage,
  };

  try {
    const { swapParams, toTokenAmount } = await getOneInchSwapParams(oneInchRequest);

    if (!gasless) {
      return await getNormalSwapManagers(
        toTokenAmount,
        slippage,
        accountAddress,
        accountInfo,
        network,
        tokens as Pair<TokenDisplayWithTicker>,
        amounts,
        swapContract,
        userBalance,
        gasPresets,
        swapParams,
      );
    }

    const gaslessFeeOptions: GasOptions = { updateOptions: { updateRate: "once" } };

    const transaction = getSwapTransaction({
      fromTokenAddress: getAddress(tokens.from),
      toTokenAddress: getAddress(tokens.to),
      accountAddress,
      swapParams,
      swapContractAddress: swapContract,
      minimumReturnAmount: "0",
      gasRefund: MINIMUM_GAS_LIMIT.toString(),
    });

    const approvalManagerPromise = await getApprovalManager({
      accountAddress,
      account: accountInfo,
      network,
      userBalance,
      token: tokens.from,
      amount: amounts.from,
      spender: swapContract,
      gasOptions: gaslessFeeOptions,
    });

    const swapManagerPromise = await getEVMTransactionService({
      transaction,
      network,
      userBalance,
      account: accountInfo,
      gasOptions: gaslessFeeOptions,
    });

    const [approvalManager, swapManager] = await Promise.all([approvalManagerPromise, swapManagerPromise]);

    if (!(swapManager.feeStrategy instanceof EIP1559FeeManager)) {
      throw new Error("Legacy fees are not supported");
    }

    const simulatedGasLimit = await getSimulationGasLimit(
      swapManager.feeStrategy.transaction as TransactionRequest,
      approvalManager?.feeStrategy.transaction,
    );

    const gasLimit = changeByPercentage(BigNumber.from(simulatedGasLimit), 30).toString();

    overrideEIP1559Fields(swapManager.feeStrategy, { gasLimit });

    const { maxPriorityFeePerGas, baseFee } = swapManager.feeStrategy.feeSettingsNormalized!;
    const { maxFeePerGas } = swapManager.feeStrategy.currentFeeSettings!;

    if (approvalManager) {
      overrideEIP1559Fields(approvalManager.feeStrategy, { maxPriorityFeePerGas, baseFee });
    }

    const requiredGasRefund = getRequiredGasRefund(
      swapManager.feeStrategy.feePrice!,
      maxFeePerGas!,
      approvalManager?.feeStrategy?.feePrice,
    );

    await validateGasRefund({
      totalCostInETH: Number(formatEther(requiredGasRefund)),
      swapContract,
      token: tokens.from,
      amount: amounts.from,
      network,
    });

    const transactionWithRefund = getSwapTransaction({
      fromTokenAddress: getAddress(tokens.from),
      toTokenAddress: getAddress(tokens.to),
      accountAddress,
      swapParams,
      swapContractAddress: swapContract,
      minimumReturnAmount: "0",
      gasRefund: requiredGasRefund.toString(),
    });

    const gaslessManager = await getEVMTransactionService({
      account: accountInfo,
      network,
      userBalance,
      transaction: transactionWithRefund,
      gasOptions: gaslessFeeOptions,
    });

    overrideEIP1559Fields(gaslessManager.feeStrategy, { maxPriorityFeePerGas, baseFee, gasLimit });

    return { approvalManager, swapManager: gaslessManager };
  } catch (error) {
    console.error(error);

    throw error;
  }
}

async function getNormalSwapManagers(
  toTokenAmount: string,
  slippage: number,
  accountAddress: string,
  accountInfo: AccountInfo,
  network: BlockchainNetwork,
  tokens: Pair<TokenSwapDetails>,
  amounts: Pair<string>,
  swapContract: string,
  userBalance: string,
  gasPresets: GasPresetSettings | undefined,
  swapParams: SwapParams,
) {
  const minimumReturnAmount = calculateMinimumReturnAmount(toTokenAmount, slippage);

  const approvalManager = await getApprovalManager({
    accountAddress,
    account: accountInfo,
    network,
    userBalance,
    token: tokens.from,
    amount: amounts.from,
    spender: swapContract,
    gasOptions: { presets: gasPresets },
  });

  const transaction = getSwapTransaction({
    fromTokenAddress: getAddress(tokens.from),
    toTokenAddress: getAddress(tokens.to),
    accountAddress,
    swapParams,
    swapContractAddress: swapContract,
    minimumReturnAmount,
    gasRefund: "0",
  });

  const swapManager = await getEVMTransactionService({
    transaction,
    account: accountInfo,
    network,
    userBalance,
    gasOptions: {
      updateOptions: approvalManager ? { updateRate: "once" } : undefined,
      presets: gasPresets,
    },
  });

  if (approvalManager) {
    const simulationGasLimit = await getSimulationGasLimit(swapManager.feeStrategy.transaction, approvalManager.feeStrategy?.transaction);

    swapManager.feeStrategy?.changeGasLimit(simulationGasLimit.toString());
  }

  return { swapManager, approvalManager };
}
