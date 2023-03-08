import { ImportedAsset } from "common/types";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "secure/imported-asset-state";

export interface Data {
  assets: ImportedAsset[];
}

export type Consumer = CommonStateConsumer<typeof topic, Data>;

export function buildDefault(): Data {
  return { assets: [] };
}

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [
    ["popup"],
    ["window", ["connect"]],
    ["web-view", ["expanded", "hardware"], "all"],
  ]);
}
