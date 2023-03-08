import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { DAppTabConnection } from "common/types";

const topic = "dapp/connect-account";

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["content-script", "all"]];

export function registerResponder(handler: (data: DAppTabConnection) => Promise<void>) {
  return registerQueryResponder<DAppTabConnection, void>(topic, acl, event => handler(event.data));
}

export async function perform(data: DAppTabConnection): Promise<void> {
  return await sendQuery<DAppTabConnection, void>(topic, "internal", data);
}
