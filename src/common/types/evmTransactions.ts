import { TransactionResponse, TransactionReceipt } from "@ethersproject/abstract-provider";

import { EVMTransactionStatus } from "./transaction";

export interface EVMTransactionEntry {
  accountUUID: string;
  networkIdentifier: string;
  txHash: string;
  timestamp: number;
  transaction: TransactionResponse;
  receipt?: TransactionReceipt;
  status: EVMTransactionStatus;
}

export type EVMTransactions = Record<string, EVMTransactionEntry>;
