import { DAppTabConnection } from "common/types";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "secure/dapp-state";

export type Consumer = CommonStateConsumer<typeof topic, DAppTabConnection[]>;

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, DAppTabConnection[]>(topic);
}

export function buildProvider(initialValue: DAppTabConnection[]) {
  return new CommonStateProvider<typeof topic, DAppTabConnection[]>(topic, initialValue, [
    ["popup"],
    ["window", ["connect"]],
    ["web-view", ["expanded", "hardware", "onboarding"], "all"],
    ["content-script", "all"],
  ]);
}
