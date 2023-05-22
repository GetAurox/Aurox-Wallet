import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { TransactionRequest } from "./wallet";

import { EVMTransactionStatus } from "./transaction";

export interface EVMTransactionEntry {
  accountUUID: string;
  networkIdentifier: string;
  txHash: string;
  timestamp: number;
  transaction: TransactionRequest & { hash: string };
  status: EVMTransactionStatus;
  receipt?: TransactionReceipt;
  gasless?: boolean;
}

export type EVMTransactions = Record<string, EVMTransactionEntry>;
