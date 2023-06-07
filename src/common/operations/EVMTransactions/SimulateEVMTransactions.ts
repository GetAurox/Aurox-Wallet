import { TransactionRequest } from "@ethersproject/abstract-provider";

import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { Simulation } from "common/types";
import { getTimeInMilliseconds } from "common/utils";

const topic = "evm-transactions/simulate";

export interface Request {
  simulator: Simulation.SupportedSimulator;
  transactions: TransactionRequest[];
  chainId: number;
}

export type Response = Simulation.Result;

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Request) => Promise<Response>) {
  return registerQueryResponder<Request, Response>(topic, acl, event => handler(event.data));
}

export async function perform(data: Request) {
  return await sendQuery<Request, Response>(topic, "internal", data, {
    timeout: getTimeInMilliseconds({ unit: "second", amount: 30 }),
  });
}
