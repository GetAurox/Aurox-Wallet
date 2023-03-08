import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config";
import { EIP1193EventType } from "common/types";
import { formatChainId } from "common/utils";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "public/dapp-state";

export interface Data {
  domain: string;
  accounts: string[];
  chainId: string;
  preferAurox: boolean;
  eventName: EIP1193EventType;
}

export type Consumer = CommonStateConsumer<typeof topic, Data>;

export function buildDefault(): Data {
  return {
    accounts: [],
    chainId: formatChainId(ETHEREUM_MAINNET_CHAIN_ID),
    domain: "",
    preferAurox: true,
    eventName: "connect",
  };
}

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [["popup"], ["window", ["connect"]], ["content-script", "all"]]);
}
