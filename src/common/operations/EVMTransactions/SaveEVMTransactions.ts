import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

import { EVMTransactionEntry } from "common/types";

const topic = "evm-transactions/save-evm-transactions";

export interface Request {
  accountUUID: string;
  networkIdentifier: string;
  transactions: EVMTransactionEntry[];
}

const acl: SenderACL = [
  ["popup"],
  ["window", ["connect"]],
  ["web-view", ["hardware", "expanded", "onboarding"], "all"],
  ["content-script", "all"],
];

export function registerResponder(handler: (data: Request) => Promise<void>) {
  return registerQueryResponder<Request, void>(topic, acl, event => handler(event.data));
}

export async function perform(data: Request) {
  return await sendQuery<Request, void>(topic, "internal", data);
}
