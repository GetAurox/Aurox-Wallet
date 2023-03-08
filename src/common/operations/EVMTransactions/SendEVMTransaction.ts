import { TransactionResponse } from "@ethersproject/abstract-provider";

import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { TransactionRequest, SendTransactionMetadata } from "common/types";
import { getTimeInMilliseconds } from "common/utils";

const topic = "evm-transactions/send";

export interface Request {
  accountUUID: string;
  networkIdentifier: string;
  transaction: TransactionRequest;
  operationId?: string;
  metadata?: SendTransactionMetadata;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Request) => Promise<TransactionResponse>) {
  return registerQueryResponder<Request, TransactionResponse>(topic, acl, event => handler(event.data));
}

export async function perform(data: Request) {
  return await sendQuery<Request, TransactionResponse>(topic, "internal", data, {
    timeout: getTimeInMilliseconds({ unit: "minute", amount: 15 }),
  });
}
