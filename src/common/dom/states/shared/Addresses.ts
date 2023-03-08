import { StateFragment } from "common/types";

import { DOMStateConsumer, createDOMStateProviderFromFragment } from "../channel";

const topic = "wallet-lock-status";

export async function buildConsumer() {
  const consumer = new DOMStateConsumer<boolean>(topic, false);

  await consumer.ready;

  return consumer;
}

export async function buildProviderFromFragment(fragment: StateFragment<boolean>) {
  return createDOMStateProviderFromFragment(topic, fragment);
}
