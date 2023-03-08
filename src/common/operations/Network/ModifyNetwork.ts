import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { BlockchainNetworkUpdate } from "common/types";

const topic = "network/modify-network";

export interface Data {
  targetNetworkIdentifier: string;
  updates: BlockchainNetworkUpdate;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(targetNetworkIdentifier: string, updates: BlockchainNetworkUpdate) {
  return await sendQuery<Data, void>(topic, "internal", { targetNetworkIdentifier, updates });
}
