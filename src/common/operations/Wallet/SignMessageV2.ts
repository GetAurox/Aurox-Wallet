import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { SignMessageData } from "common/types";
import { getTimeInMilliseconds } from "common/utils";

const topic = "wallet/sign-message-v2";

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["onboarding"], "all"]];

export function registerResponder(handler: (data: SignMessageData) => Promise<string>) {
  return registerQueryResponder<SignMessageData, string>(topic, acl, event => handler(event.data));
}

export async function perform(data: SignMessageData) {
  return await sendQuery<SignMessageData, string>(topic, "internal", data, {
    timeout: getTimeInMilliseconds({ unit: "minute", amount: 15 }),
  });
}
