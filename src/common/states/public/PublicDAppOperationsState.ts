import { Operation } from "common/types";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "public/dapp-operations-state";

export interface Data {
  operations: Operation[];
}

export type Consumer = CommonStateConsumer<typeof topic, Data>;
export type Provider = CommonStateProvider<typeof topic, Data>;

export function buildDefault(): Data {
  return {
    operations: [],
  };
}

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [["popup"], ["window", ["connect"]], ["content-script", "all"]]);
}
