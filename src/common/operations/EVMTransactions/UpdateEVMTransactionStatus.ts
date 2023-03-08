import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

import { EVMTransactionStatus } from "common/types";

const topic = "evm-transactions/update-evm-transaction-status";

export interface Request {
  accountUUID: string;
  networkIdentifier: string;
  transactionHash: string;
  status: EVMTransactionStatus;
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
