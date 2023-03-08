import { SenderACL, registerQueryResponder, sendQuery } from "common/messaging";

const topic = "wallet/switch-account";

export interface Data {
  switchToUUID: string;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["expanded", "hardware"], "all"], ["content-script", "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(switchToUUID: string) {
  return await sendQuery<Data, void>(topic, "internal", { switchToUUID });
}
