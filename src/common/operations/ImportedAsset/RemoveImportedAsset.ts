import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "imported-asset/remove-imported-asset";

export interface Data {
  targetAssetKey: string;
}

const acl: SenderACL = [["popup"], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(targetAssetKey: string) {
  return await sendQuery<Data, void>(topic, "internal", { targetAssetKey });
}
