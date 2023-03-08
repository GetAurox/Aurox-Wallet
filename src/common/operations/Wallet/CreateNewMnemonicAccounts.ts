import { registerQueryResponder, sendQuery } from "common/messaging";

import { MnemonicAccountCreationData } from "common/types";

const topic = "wallet/create-new-mnemonic-accounts";

export interface Data {
  skipAccountSwitching: boolean;
  items: MnemonicAccountCreationData[];
}

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(items: MnemonicAccountCreationData[], options?: { skipAccountSwitching: boolean }) {
  await sendQuery<Data, void>(topic, "internal", { items, skipAccountSwitching: options?.skipAccountSwitching ?? false });
}
