import { HardwareOperation } from "common/types";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "secure/hardware-state";

export interface Data {
  operation: HardwareOperation | null;
}

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [["web-view", ["hardware"], "all"]]);
}
