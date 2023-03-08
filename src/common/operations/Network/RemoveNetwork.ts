import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "network/remove-network";

export interface Data {
  targetNetworkIdentifier: string;
}

const acl: SenderACL = [["popup"], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(targetNetworkIdentifier: string) {
  return await sendQuery<Data, void>(topic, "internal", { targetNetworkIdentifier });
}
