import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { TransactionRequest } from "common/types";
import { getTimeInMilliseconds } from "common/utils";

const topic = "evm-transactions/gasless-send";

export interface Request {
  accountUUID: string;
  networkIdentifier: string;
  swapTransaction: TransactionRequest;
  approvalTransaction?: TransactionRequest;
}

const acl: SenderACL = [["popup"]];

export function registerResponder(handler: (data: Request) => Promise<string>) {
  return registerQueryResponder<Request, string>(topic, acl, event => handler(event.data));
}

export async function perform(data: Request) {
  return await sendQuery<Request, string>(topic, "internal", data, {
    timeout: getTimeInMilliseconds({ unit: "minute", amount: 15 }),
  });
}
