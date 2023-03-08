import { EVMTransactions } from "common/types";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "secure/evm-transactions-state";

export interface Data {
  evmTransactionsData: EVMTransactions;
}

export type Consumer = CommonStateConsumer<typeof topic, Data>;
export type Provider = CommonStateProvider<typeof topic, Data>;

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [
    ["popup"],
    ["window", ["connect"]],
    ["web-view", ["hardware", "expanded", "onboarding"], "all"],
    ["content-script", "all"],
  ]);
}
