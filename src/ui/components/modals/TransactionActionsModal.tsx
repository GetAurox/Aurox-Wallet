import { useCallback, useEffect, useMemo } from "react";

import { Button } from "@mui/material";

import { EVMTransactionStatus } from "common/types";
import { EVMTransactions } from "common/operations";
import { ProviderManager } from "common/wallet";

import { useAccountByUUID, useNetworkGetter } from "ui/hooks";
import { useTransactionManager } from "ui/hooks/rpc";
import { useEVMTransactionsOfAccount } from "ui/hooks/states/evmTransactions";
import { useHistoryPush } from "ui/common/history";

import DialogBase from "ui/components/common/DialogBase";
import NetworkFee from "ui/components/flows/feeSelection/NetworkFee";

import { getCancelTransaction, getSpeedUpTransaction, getTransactionReplacementGasSettings } from "./helpers";

export interface TransactionActionsModalProps {
  accountUUID: string;
  networkIdentifier: string;
  transactionHash: string;
  action: "cancel" | "speedUp" | null;
  onCompleted: () => void;
  onClose: () => void;
}

export default function TransactionActionsModal(props: TransactionActionsModalProps) {
  const { accountUUID, networkIdentifier, transactionHash, action, onClose, onCompleted } = props;

  const transactionEntryKey = `${accountUUID}||${networkIdentifier}||${transactionHash}`;

  const push = useHistoryPush();
  const networkGetter = useNetworkGetter();

  const account = useAccountByUUID(accountUUID);
  const transactions = useEVMTransactionsOfAccount(accountUUID);

  const originalTransaction = transactions?.[transactionEntryKey]?.transaction ?? null;

  const transaction = useMemo(() => {
    if (!originalTransaction) {
      return null;
    }

    return action === "speedUp" ? getSpeedUpTransaction(originalTransaction) : getCancelTransaction(originalTransaction);
  }, [originalTransaction, action]);

  const transactionManager = useTransactionManager(account, networkIdentifier, transaction);

  // Increase the gas preferences
  useEffect(() => {
    if (!originalTransaction || !originalTransaction.gasLimit || !transactionManager?.feeStrategy?.currentFeeSettings) {
      return;
    }

    const overrides = getTransactionReplacementGasSettings({
      originalTransaction,
      currentFeeSettings: transactionManager.feeStrategy.currentFeeSettings,
    });

    if (overrides.gasPrice) {
      transactionManager.feeStrategy.changeGasPrice(overrides.gasPrice);
    } else if (!!overrides.baseFee && overrides.maxPriorityFeePerGas) {
      transactionManager.feeStrategy.changeBaseFee(overrides.baseFee);
      transactionManager.feeStrategy.changeMaxPriorityFeePerGas(overrides.maxPriorityFeePerGas);
    }
  }, [originalTransaction, transactionManager?.feeStrategy]);

  const onConfirm = useCallback(async () => {
    if (!transactionManager || !originalTransaction) {
      return;
    }

    const network = networkGetter(networkIdentifier);

    if (!network) {
      throw new Error("Unrecognized network");
    }

    const provider = ProviderManager.getProvider(network);

    const receipt = await provider.getTransactionReceipt(originalTransaction.hash);

    if (receipt) {
      console.error("Transaction already completed");

      onCompleted();

      return;
    }

    const { hash } = await transactionManager.sendTransaction({ nonce: originalTransaction.nonce });

    const status = action == "cancel" ? EVMTransactionStatus.Cancelled : EVMTransactionStatus.Replaced;

    await EVMTransactions.UpdateEVMTransactionStatus.perform({ accountUUID, networkIdentifier, transactionHash: hash, status });

    onCompleted();

    push(`/transactions/${hash}/details`);
  }, [transactionManager, originalTransaction, accountUUID, networkIdentifier, action, networkGetter, onCompleted, push]);

  return (
    <DialogBase
      open
      onClose={onClose}
      title="Do you want to proceed?"
      content={<NetworkFee networkIdentifier={networkIdentifier} feeManager={transactionManager?.feeStrategy ?? null} />}
      actions={
        <Button fullWidth variant="contained" onClick={onConfirm}>
          {action === "speedUp" ? "Speed up" : "Cancel Transaction"}
        </Button>
      }
    />
  );
}
