import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { BlockchainNetwork } from "common/types";

const topic = "network/add-network";

export interface Data {
  newNetwork: BlockchainNetwork;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(newNetwork: BlockchainNetwork) {
  return await sendQuery<Data, void>(topic, "internal", { newNetwork });
}
