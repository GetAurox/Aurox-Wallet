import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "dapp/switch-network";

export interface Data {
  domain: string;
  tabId: number;
  targetNetworkIdentifier: string;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["expanded", "hardware"], "all"], ["content-script", "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(data: Data) {
  return await sendQuery<Data, void>(topic, "internal", data);
}
