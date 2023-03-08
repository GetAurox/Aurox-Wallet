import { CommonStateConsumer, CommonStateProvider } from "../channel";

const topic = "secure/password-state";

export interface Data {
  hasPassword: boolean;
  isPasswordVerified: boolean;
}

export type Consumer = CommonStateConsumer<typeof topic, Data>;

export function buildDefault(): Data {
  return { hasPassword: false, isPasswordVerified: false };
}

export function buildConsumer() {
  return new CommonStateConsumer<typeof topic, Data>(topic);
}

export function buildProvider(initialValue: Data) {
  return new CommonStateProvider<typeof topic, Data>(topic, initialValue, [
    ["popup"],
    ["window", ["connect"]],
    ["web-view", ["expanded"], "all"],
  ]);
}
