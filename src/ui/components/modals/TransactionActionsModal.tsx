import { BigNumber } from "ethers";
import { useEffect, useState } from "react";

import { EVMTransactionStatus, RawTransaction } from "common/types";

import DialogBase from "ui/components/common/DialogBase";
import NetworkFee from "ui/components/flows/feeSelection/NetworkFeeV2";
import { useAccountByUUID } from "ui/hooks";

import { useTransactionManager } from "ui/hooks/rpc";

import { Button } from "@mui/material";
import { EVMTransactions } from "common/operations";
import { useEVMTransactionsOfAccount } from "ui/hooks/states/evmTransactions";
import { useHistoryPush } from "ui/common/history";

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

  const [transaction, setTransaction] = useState<RawTransaction | null>(null);
  const [nonce, setNonce] = useState<number | undefined>(undefined);

  const transactions = useEVMTransactionsOfAccount(accountUUID);

  const transactionManager = useTransactionManager(account, networkIdentifier, transaction);

  useEffect(() => {
    const getTransaction = async () => {
      if (!networkIdentifier || !action || !transactions) return;

      const key = `${accountUUID}||${networkIdentifier}||${transactionHash}`;

      const { from, to, value, data, nonce } = transactions[key].transaction;

      setNonce(nonce);

      if (to && action === "speedUp") {
        setTransaction({ from, data, to, value: BigNumber.from(value).toHexString() });
      } else if (action === "cancel") {
        // Cancel is sending 0 ETH to yourself
        const emptyTransaction = { from, to: from, data: "0x", value: "0x0" };

        setTransaction(emptyTransaction);
      }
    };

    getTransaction();
  }, [networkIdentifier, accountUUID, action, transactionHash, transactions]);

  const onConfirm = async () => {
    if (transactionManager && nonce) {
      transactionManager.overrideNonce(nonce);

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
