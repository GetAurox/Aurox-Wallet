import { MultichainBalances } from "common/types";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "public/balances-state";

export type Consumer = CommonStateConsumer<typeof topic, MultichainBalances>;

export function buildDefault(): MultichainBalances {
  return {};
}

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, MultichainBalances>(topic);
}

export function buildProvider(initialValue: MultichainBalances) {
  return new CommonStateProvider<typeof topic, MultichainBalances>(topic, initialValue, [
    ["popup"],
    ["window", ["connect"]],
    ["web-view", ["expanded", "hardware"], "all"],
    ["content-script", "all"],
  ]);
}
