import { StateFragment } from "common/types";

import { DOMStateConsumer, createDOMStateProviderFromFragment } from "../channel";

const topic = "selected-network";

export interface Data {
  /** Hex representation of the chain id */
  chainId: string | null;
  name: string | null;
}

export type Consumer = DOMStateConsumer<Data>;

export function buildDefault(): Data {
  return { chainId: null, name: null };
}

export async function buildConsumer() {
  const consumer = new DOMStateConsumer<Data>(topic, buildDefault());

  await consumer.ready;

  return consumer;
}

export async function buildProviderFromFragment(fragment: StateFragment<Data>) {
  return createDOMStateProviderFromFragment(topic, fragment);
}
