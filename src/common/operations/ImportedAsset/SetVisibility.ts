import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { ImportedAssetVisibility } from "common/types";

const topic = "imported-asset/set-visibility";

export interface Data {
  targetAssetKey: string;
  newVisibilityValue: ImportedAssetVisibility;
}

const acl: SenderACL = [["popup"], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(targetAssetKey: string, newVisibilityValue: ImportedAssetVisibility) {
  return await sendQuery<Data, void>(topic, "internal", { targetAssetKey, newVisibilityValue });
}
