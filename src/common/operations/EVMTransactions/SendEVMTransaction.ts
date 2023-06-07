import { TransactionResponse } from "@ethersproject/abstract-provider";

import { getTimeInMilliseconds } from "common/utils";
import { TransactionRequest, SendTransactionMetadata } from "common/types";
import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "evm-transactions/send";

export type Payload = { transaction: TransactionRequest; metadata?: SendTransactionMetadata };
export type ExecutionOrder = "paralell" | "sequential";

export interface Request {
  accountUUID: string;
  networkIdentifier: string;
  transactions: Payload[];
  executionOrder?: ExecutionOrder;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Request) => Promise<TransactionResponse[]>) {
  return registerQueryResponder<Request, TransactionResponse[]>(topic, acl, event => handler(event.data));
}

export async function perform(data: Request) {
  return await sendQuery<Request, TransactionResponse[]>(topic, "internal", data, {
    timeout: getTimeInMilliseconds({ unit: "minute", amount: 15 }),
  });
}
