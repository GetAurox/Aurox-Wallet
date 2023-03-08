import { TransactionResponse, TransactionReceipt } from "@ethersproject/abstract-provider";

import { createStateMigrator } from "common/storage/utils";
import { EVMTransactionStatus } from "common/types";

const topic = "evm_transactions_data";

interface EVMTransactionEntryV0 {
  accountUUID: string;
  networkIdentifier: string;
  txHash: string;
  timestamp: number;
  transaction: TransactionResponse;
  receipt?: TransactionReceipt;
}

interface EVMTransactionEntryV1 extends EVMTransactionEntryV0 {
  status: EVMTransactionStatus;
}

type EVMTransactionsV0 = Record<string, EVMTransactionEntryV0>;
type EVMTransactionsV1 = Record<string, EVMTransactionEntryV1>;

function v0_v1_addStatusToEVMTransactionEntry(old: EVMTransactionsV0): EVMTransactionsV1 {
  const resolveStatus = (entry: EVMTransactionEntryV0): EVMTransactionStatus => {
    if (!entry.receipt) return EVMTransactionStatus.Pending;

    return entry.receipt.status as EVMTransactionStatus;
  };

  const result = {} as EVMTransactionsV1;

  for (const key of Object.keys(old)) {
    result[key] = { ...old[key], status: resolveStatus(old[key]) };
  }

  return result;
}

// the order is very critical, never change this array, only append
const migrations = [v0_v1_addStatusToEVMTransactionEntry];

const migrator = createStateMigrator<EVMTransactionsV1>(topic, migrations, { sensitive: false });

export { migrator };
