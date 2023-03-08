import { BlockchainNetwork } from "common/types";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "public/network-state";

export interface Data {
  networks: BlockchainNetwork[];
}

export type Consumer = CommonStateConsumer<typeof topic, Data>;

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [
    ["popup"],
    ["window", ["connect"]],
    ["web-view", ["expanded", "hardware"], "all"],
    ["content-script", "all"],
  ]);
}
