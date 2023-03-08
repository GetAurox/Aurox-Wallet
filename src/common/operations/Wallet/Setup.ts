import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { WalletSetupMethod } from "common/types";

const topic = "wallet/setup";

export interface Data {
  setupMethod: WalletSetupMethod | null;
  mnemonics: string[];
  firstAccountAlias: string;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["onboarding"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(setupMethod: WalletSetupMethod | null, mnemonics: string[], firstAccountAlias: string) {
  return await sendQuery<Data, void>(topic, "internal", { setupMethod, mnemonics, firstAccountAlias });
}
