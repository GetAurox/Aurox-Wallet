import { StateFragment } from "common/types";

import { DOMStateConsumer, createDOMStateProviderFromFragment } from "../channel";

const topic = "dapp/connection";

export interface Connection {
  chainId: string;
  accounts: string[];
  preferAurox: boolean;
}

export type Consumer = DOMStateConsumer<Connection | null>;

export async function buildConsumer() {
  const consumer = new DOMStateConsumer<string | null>(topic, null);

  await consumer.ready;

  return consumer;
}

export async function buildProviderFromFragment(fragment: StateFragment<Connection | null>) {
  return createDOMStateProviderFromFragment(topic, fragment);
}
