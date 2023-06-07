import { BigNumber } from "@ethersproject/bignumber";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { formatUnits } from "@ethersproject/units";

import axios from "axios";
import omit from "lodash/omit";
import Decimal from "decimal.js";

import { EVMTransactions } from "common/operations";
import { DEFAULT_DECIMALS, ETHEREUM_MAINNET_CHAIN_ID, ETH_ADDRESS, ONE_INCH_API_URL } from "common/config";
import { TokenSwapSlippageTolerance } from "common/types";

import { TokenDisplayWithTicker, TokenSwapDetails } from "ui/types";
import { DEFAULT_SWAP_GAS_LIMIT } from "ui/common/tokens";

import { hexValue } from "ethers/lib/utils";

import { ForwardingSwapProxy__factory } from "../typechain/factories/ForwardingSwapProxy__factory";

import { EVMProvider, ProviderManager } from "../Provider";

import { GasRefundRequest, GetExchangeRateParams, OneInchSwapRequest, OneInchSwapResult } from "./types";

export const OneInchAxiosInstance = axios.create({
  baseURL: ONE_INCH_API_URL,
});

export const DEFAULT_SLIPPAGE = 1;

export const getOneInchSwapParams = async (props: OneInchSwapRequest): Promise<OneInchSwapResult> => {
  const { swapFromAddress, swapToAddress, amount, chainId, slippage, destReceiver, from } = props;

  const { data, status } = await OneInchAxiosInstance.get<OneInchSwapResult>(`/${chainId}/swap`, {
    params: {
      fromTokenAddress: swapFromAddress,
      toTokenAddress: swapToAddress,
      fromAddress: from,
      amount,
      slippage,
      disableEstimate: true,
      allowPartialFill: false,
      destReceiver,
    },
  });

  if (status !== 200) {
    throw new Error("Failed to get quota from 1inch");
  }

  const swapParams = {
    to: data.tx.to,
    data: data.tx.data,
    amount,
    value: swapFromAddress === ETH_ADDRESS ? data.tx.value : "0",
  };

  // One-inch responds with these fields, but they cause issues with ethers if we pass them through
  const omitted = omit(data, ["tx.gas", "tx.gasPrice"]);
  omitted.swapParams = swapParams;

  return omitted as OneInchSwapResult;
};

/** Returns slippage as a number based on the selected preference */
export function getSlippageValueFromToleranceType(slippage: TokenSwapSlippageTolerance): number {
  if (typeof slippage === "number") return slippage;

  if (slippage === "auto") return DEFAULT_SLIPPAGE;

  return slippage.custom ?? DEFAULT_SLIPPAGE;
}

/** Returns slippage type based on the selected value */
export function getSlippageToleranceTypeFromValue(slippage: number): TokenSwapSlippageTolerance {
  if (slippage === 1) return "auto";

  return slippage;
}

/** Returns exchange rate between two tokens from proxy contract */
export async function getExchangeRate(params: GetExchangeRateParams) {
  const { fromTokenAddress, toTokenAddress, contractAddress, provider } = params;

  const contract = ForwardingSwapProxy__factory.connect(contractAddress, provider);

  return await contract.getExchangeRate(fromTokenAddress, toTokenAddress);
}

/** Returns token contract address */
export function getAddress(token: TokenDisplayWithTicker | TokenSwapDetails): string {
  return token.assetDefinition.type === "native" ? ETH_ADDRESS : token.assetDefinition.contractAddress;
}

/** Simulates bundled swap and returns estimated gas limit for the swap transaction */
export async function getSimulationGasLimit(swapTransaction: TransactionRequest, approvalTransaction?: TransactionRequest) {
  if (swapTransaction.chainId !== ETHEREUM_MAINNET_CHAIN_ID) {
    return DEFAULT_SWAP_GAS_LIMIT;
  }

  const swapTransactionUpdated = {
    ...swapTransaction,
    gasLimit: hexValue(DEFAULT_SWAP_GAS_LIMIT),
  };

  const transactions = approvalTransaction ? [approvalTransaction, swapTransactionUpdated] : [swapTransaction];

  const simulation = await EVMTransactions.SimulateEVMTransactions.perform({
    transactions,
    chainId: ETHEREUM_MAINNET_CHAIN_ID,
    simulator: "alchemy",
  });

  if (!simulation.success) {
    console.error(simulation.error);

    throw new Error(simulation.error);
  }

  return simulation.gasUsed[transactions.length - 1];
}

/** Returns amount reduced by the slippage percentage
 * @param amount - Amount in WEI
 * @param slippage - Percentage to allow the slippage, anything beyond 100% will return 0
 */
export function calculateMinimumReturnAmount(amount: string, slippage: number): string {
  const converted = {
    amount: new Decimal(amount),
    slippage: new Decimal(slippage),
    one: new Decimal(1),
  };

  const factor = converted.one.minus(converted.slippage.dividedBy(100));

  if (factor.isNegative()) {
    return "0";
  }

  return converted.amount.times(factor).toFixed(0);
}

/** Get sum of the entire bundle cost
 * Bundle is a group of three transactions: swap, approval and sponsor transaction
 * Required by gasless service
 * */
export function getRequiredGasRefund(swapPrice: BigNumber, maxFeePerGas: BigNumber, approvalPrice?: BigNumber | null) {
  const sponsoredTxCost = maxFeePerGas.mul(21000);

  return sponsoredTxCost
    .add(swapPrice)
    .add(approvalPrice ?? 0)
    .add(1);
}

/**
 * Makes sure that the amount of from tokens
 * represented in ETH is bigger than the required gas refund.
 * Required by proxy contract
 */
export async function validateGasRefund(params: GasRefundRequest) {
  const { token, swapContract, network, amount, totalCostInETH } = params;

  const { provider } = ProviderManager.getProvider(network) as EVMProvider;

  const totalCost = new Decimal(totalCostInETH);

  // Conversion rate ETH -> ERC20 1 / 1800
  const ratio = await getExchangeRate({
    fromTokenAddress: getAddress(token),
    toTokenAddress: ETH_ADDRESS,
    contractAddress: swapContract,
    provider,
  });

  const normalizedRatio = new Decimal(formatUnits(ratio, DEFAULT_DECIMALS));

  const tokenAmount = new Decimal(amount);

  const tokenAmountInETH = tokenAmount.times(normalizedRatio).toDP(DEFAULT_DECIMALS);

  if (tokenAmountInETH.lessThan(totalCost)) {
    const minimumTokenAmount = totalCost.div(normalizedRatio).toFixed(2);

    throw new Error(`Expected at least ${minimumTokenAmount} ${token.symbol}`);
  }
}

export function getEstimatedGaslessTokenOutput(
  tokenAmount: string | number,
  tokenPriceUSD: string | number,
  networkFeeUSD: string | number,
) {
  if (!tokenAmount || !tokenPriceUSD || !networkFeeUSD) {
    return;
  }

  const tokenAmountDecimal = new Decimal(tokenAmount);
  const tokenPriceUSDDecimal = new Decimal(tokenPriceUSD);
  const networkFeeUSDDecimal = new Decimal(networkFeeUSD);

  return tokenAmountDecimal.times(tokenPriceUSDDecimal).minus(networkFeeUSDDecimal).div(tokenPriceUSDDecimal).toFixed(4);
}

export function getGaslessFeeInTokens(tokenPriceUSD: string | number, networkFeeUSD: string | number) {
  if (!tokenPriceUSD || !networkFeeUSD) {
    return;
  }

  const tokenPriceUSDDecimal = new Decimal(tokenPriceUSD);
  const networkFeeUSDDecimal = new Decimal(networkFeeUSD);

  return networkFeeUSDDecimal.div(tokenPriceUSDDecimal).toFixed(4);
}
