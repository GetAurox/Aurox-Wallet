import pick from "lodash/pick";

import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";

import { EVMTransactions } from "common/operations";
import { getTimeInMilliseconds } from "common/utils";
import { RawTransaction, TransactionRequest, SendTransactionMetadata, EVMTransactionStatus } from "common/types";

import { GasPresetSettings } from "ui/types";

import { EIP1559FeeManager, LegacyFeeManager, EVMFeeStrategy, TransactionType } from "ui/common/fee";

import { EVMProvider, JsonRPCProviderWithRetry, ProviderManager } from "common/wallet";

import { EVMTransactionService, EVMTransactionServiceProps } from "./types";
import { DEFAULT_FEE_UPDATE_INTERVAL } from "./constants";

async function resolveFeeStrategy(
  transaction: RawTransaction & { type?: string | number },
  provider: JsonRPCProviderWithRetry,
  userBalance: string,
  gasPresets?: GasPresetSettings,
) {
  try {
    const tx = pick(transaction, ["data", "from", "to", "value"]);

    if (transaction?.type) {
      const type = BigNumber.from(transaction.type);

      const Manager = type.eq(TransactionType.EIP1559) ? EIP1559FeeManager : LegacyFeeManager;

      return new Manager(tx, provider, parseEther(userBalance), gasPresets);
    }

    const block = await provider.getBlock("latest");

    const isEIP1559 = BigNumber.isBigNumber(block.baseFeePerGas);

    const Manager = isEIP1559 ? EIP1559FeeManager : LegacyFeeManager;

    return new Manager(tx, provider, parseEther(userBalance), gasPresets);
  } catch (error) {
    console.error("Can not resolve network fee structure", error);

    return null;
  }
}

function prepareSendTransaction(
  feeManager: EVMFeeStrategy,
  accountUUID: string,
  networkIdentifier: string,
  provider: JsonRPCProviderWithRetry,
  abortFeeUpdate?: () => void,
) {
  return async (metadata?: SendTransactionMetadata) => {
    try {
      abortFeeUpdate?.();

      const transaction = { ...feeManager.transaction, ...metadata?.feeOverride };

      const [{ hash }] = await EVMTransactions.SendEVMTransaction.perform({
        accountUUID,
        networkIdentifier,
        transactions: [
          {
            transaction: transaction as TransactionRequest,
            metadata,
          },
        ],
      });

      const waitForReceipt = () => provider.waitForTransaction(hash, 1, getTimeInMilliseconds({ amount: 1, unit: "minute" }));

      const getTransactionStatus = async () => {
        const receipt = await provider.getTransactionReceipt(hash);

        return !receipt?.status ? EVMTransactionStatus.Pending : (receipt.status as EVMTransactionStatus);
      };

      return { hash, waitForReceipt, getTransactionStatus };
    } catch (error) {
      throw error.message ?? error;
    }
  };
}

export function sendMultipleTransactions(params: EVMTransactions.SendEVMTransaction.Request) {
  return EVMTransactions.SendEVMTransaction.perform(params);
}

export async function getEVMTransactionService(props: EVMTransactionServiceProps): Promise<EVMTransactionService> {
  const { transaction, account, network, userBalance, gasOptions } = props;

  const { provider } = ProviderManager.getProvider(network) as EVMProvider;

  const feeStrategy = await resolveFeeStrategy(transaction, provider, userBalance, gasOptions.presets);

  if (!feeStrategy) {
    throw new Error(`Failed to resolve fee strategy for '${network.name}' network`);
  }

  await feeStrategy.updateFees();

  if (gasOptions.updateOptions?.updateRate === "once") {
    return { feeStrategy, sendTransaction: prepareSendTransaction(feeStrategy, account.uuid, network.identifier, provider) };
  }

  const updateJobId = setInterval(() => feeStrategy.updateFees(), gasOptions.updateOptions?.frequency || DEFAULT_FEE_UPDATE_INTERVAL);

  const cancelUpdate = () => {
    if (updateJobId) {
      clearInterval(updateJobId);
    }
  };

  return {
    feeStrategy,
    cancelUpdate,
    sendTransaction: prepareSendTransaction(feeStrategy, account.uuid, network.identifier, provider, cancelUpdate),
  };
}
