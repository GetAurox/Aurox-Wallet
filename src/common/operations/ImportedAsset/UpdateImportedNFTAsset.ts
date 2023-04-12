import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

import { ImportedAssetUpdateNFT } from "serviceWorker/managers";

const topic = "imported-asset/update-imported-nft-asset";

export interface Data {
  updatedNFTAsset: ImportedAssetUpdateNFT;
}

const acl: SenderACL = [["popup"], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(updatedNFTAsset: ImportedAssetUpdateNFT) {
  return await sendQuery<Data, void>(topic, "internal", { updatedNFTAsset });
}
