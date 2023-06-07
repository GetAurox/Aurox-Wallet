import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "secure/gasless-transaction-state";

export interface Data {
  approvalTransactionSigned: boolean;
  swapTransactionSigned: boolean;
  gaslessTransactionHash?: string;
}

export type Consumer = CommonStateConsumer<typeof topic, Data>;
export type Provider = CommonStateProvider<typeof topic, Data>;

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [
    ["popup"],
    ["web-view", ["hardware", "expanded", "onboarding"], "all"],
  ]);
}
