import { TransactionResponse, TransactionReceipt } from "@ethersproject/abstract-provider";

import { createStateMigrator } from "common/storage/utils";
import { EVMTransactionStatus, TransactionRequest } from "common/types";

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

interface EVMTransactionEntryV2 extends Omit<EVMTransactionEntryV1, "transaction"> {
  transaction: TransactionRequest & { hash: string };
}

type EVMTransactionsV0 = Record<string, EVMTransactionEntryV0>;
type EVMTransactionsV1 = Record<string, EVMTransactionEntryV1>;
export type EVMTransactionsV2 = Record<string, EVMTransactionEntryV2>;

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

function v1_v2_changeTransactionModel(old: EVMTransactionsV1): EVMTransactionsV2 {
  const mapReceiptToRequest = (entry: EVMTransactionEntryV1): TransactionRequest & { hash: string } => {
    return {
      ...entry.transaction,
      gasLimit: entry.transaction.gasLimit.toString(),
      gasPrice: entry.transaction.gasPrice?.toString(),
      value: entry.transaction.value.toString(),
      type: entry.transaction.type ?? 0,
      maxFeePerGas: entry.transaction.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: entry.transaction.maxPriorityFeePerGas?.toString(),
    };
  };

  const result = {} as EVMTransactionsV2;

  for (const key of Object.keys(old)) {
    result[key] = { ...old[key], transaction: mapReceiptToRequest(old[key]) };
  }

  return result;
}

// the order is very critical, never change this array, only append
const migrations = [v0_v1_addStatusToEVMTransactionEntry, v1_v2_changeTransactionModel];

const migrator = createStateMigrator<EVMTransactionsV2>(topic, migrations, { sensitive: false });

export { migrator };
