import { AccountInfo, WalletSetupMethod } from "common/types";

import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "secure/wallet-state";

export interface Data {
  isWalletSetup: boolean;
  isWalletUnlocked: boolean;
  accounts: Record<string, AccountInfo>;
  accountUUIDs: string[];
  activeAccountUUID: string | null;
  setupMethod: WalletSetupMethod | null;
}

export type Consumer = CommonStateConsumer<typeof topic, Data>;

export function buildDefault(): Data {
  return {
    isWalletSetup: false,
    isWalletUnlocked: false,
    accounts: {},
    accountUUIDs: [],
    activeAccountUUID: null,
    setupMethod: null,
  };
}

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [
    ["popup"],
    ["window", ["connect"]],
    ["web-view", ["expanded", "hardware", "onboarding"], "all"],
    ["content-script", "all"],
  ]);
}
