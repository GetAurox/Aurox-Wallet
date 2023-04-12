import { useEffect, useState } from "react";

import { TransactionResponse } from "@ethersproject/abstract-provider";
import { formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";

import { Button } from "@mui/material";

import { EVMTransactionStatus, RawTransaction } from "common/types";
import { EVMTransactions } from "common/operations";
import { restoreBigNumberFields } from "common/utils";

import { useAccountByUUID, useNetworkGetter } from "ui/hooks";
import { useTransactionManager } from "ui/hooks/rpc";
import { useEVMTransactionsOfAccount } from "ui/hooks/states/evmTransactions";
import { useHistoryPush } from "ui/common/history";
import { TransactionType } from "ui/common/fee";

import DialogBase from "ui/components/common/DialogBase";
import NetworkFee from "ui/components/flows/feeSelection/NetworkFeeV2";
import { ProviderManager } from "common/wallet";

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

  const push = useHistoryPush();

  const account = useAccountByUUID(accountUUID);

  const networkGetter = useNetworkGetter();

  const [transaction, setTransaction] = useState<RawTransaction | null>(null);
  const [originalTransaction, setOriginalTransaction] = useState<TransactionResponse | null>(null);

  const transactions = useEVMTransactionsOfAccount(accountUUID);

  const transactionManager = useTransactionManager(account, networkIdentifier, transaction);

  useEffect(() => {
    if (!networkIdentifier || !action || !transactions) return;

    const key = `${accountUUID}||${networkIdentifier}||${transactionHash}`;

    const originalTransaction = restoreBigNumberFields<TransactionResponse>(transactions[key].transaction);

    const { from, to, value, data } = originalTransaction;

    let transaction;

    if (to && action === "speedUp") {
      transaction = { from, data, to, value: value.toHexString() };
    } else {
      // Cancel is sending 0 ETH to yourself
      transaction = { from, to: from, data: "0x", value: "0x0" };
    }

    setOriginalTransaction(originalTransaction);
    setTransaction(transaction);
  }, [networkIdentifier, accountUUID, action, transactionHash, transactions]);

  // Increase the gas preferences
  useEffect(() => {
    if (!originalTransaction || !originalTransaction.gasLimit || !transactionManager?.feeManager?.currentFeeSettings) {
      return;
    }

    const maxBigNumber = (valueA: BigNumber | undefined, valueB: BigNumber) => {
      return valueA?.gt(valueB) ? valueA : valueB;
    };

    if (transactionManager.feeManager.currentFeeSettings.type === TransactionType.EIP1559) {
      const { maxPriorityFeePerGas } = transactionManager.feeManager.currentFeeSettings;

      const newMaxPriorityFeePerGas = maxBigNumber(originalTransaction.maxPriorityFeePerGas, maxPriorityFeePerGas).mul(2);

      transactionManager.feeManager.changeMaxPriorityFeePerGas(formatUnits(newMaxPriorityFeePerGas, "gwei"));
    } else {
      const { gasPrice } = transactionManager.feeManager.currentFeeSettings;

      const newGasPrice = maxBigNumber(originalTransaction.gasPrice, gasPrice).mul(2);

      transactionManager.feeManager.changeGasPrice(formatUnits(newGasPrice, "gwei"));
    }
  }, [originalTransaction, transactionManager?.feeManager]);

  const onConfirm = async () => {
    if (transactionManager && originalTransaction) {
      const network = networkGetter(networkIdentifier);

      if (!network) {
        throw new Error("Unrecognized network");
      }

      const provider = ProviderManager.getProvider(network);

      const receipt = await provider.getTransactionReceipt(originalTransaction.hash);

      if (receipt?.status) {
        console.error("Transaction already completed");

        onCompleted();

        return;
      }

      transactionManager.overrideNonce(originalTransaction.nonce);

      await transactionManager.sendTransaction();

      if (transactionManager.transactionHash) {
        const status = action == "cancel" ? EVMTransactionStatus.Cancelled : EVMTransactionStatus.Replaced;

        await EVMTransactions.UpdateEVMTransactionStatus.perform({ accountUUID, networkIdentifier, transactionHash, status });

        onCompleted();

        push(`/transactions/${transactionManager.transactionHash}/details`);
      }
    }
  };

  return (
    <DialogBase
      open
      onClose={onClose}
      title="Do you want to proceed?"
      content={<NetworkFee networkIdentifier={networkIdentifier} feeManager={transactionManager?.feeManager ?? null} />}
      actions={
        <Button fullWidth variant="contained" onClick={onConfirm}>
          {action === "speedUp" ? "Speed up" : "Cancel Transaction"}
        </Button>
      }
    />
  );
}
