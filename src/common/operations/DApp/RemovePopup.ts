import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "dapp/remove-popup";

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["content-script", "all"]];

export function registerResponder(handler: () => Promise<void>) {
  return registerQueryResponder<{}, void>(topic, acl, () => handler());
}

export async function perform(): Promise<void> {
  return await sendQuery<{}, void>(topic, "internal", {});
}
