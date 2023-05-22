import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { TransactionRequest } from "common/types";
import { getTimeInMilliseconds } from "common/utils";

const topic = "wallet/sign-transaction-v2";

const acl: SenderACL = [["popup"]];

export interface Data {
  accountUUID: string;
  networkIdentifier: string;
  transaction: TransactionRequest;
}

export function registerResponder(handler: (data: Data) => Promise<string>) {
  return registerQueryResponder<Data, string>(topic, acl, event => handler(event.data));
}

export async function perform(data: Data) {
  return await sendQuery<Data, string>(topic, "internal", data, {
    timeout: getTimeInMilliseconds({ unit: "minute", amount: 15 }),
  });
}
