import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { ImportedAsset, ImportNewAssetResult } from "common/types";

const topic = "imported-asset/import-new-asset";

export interface Request {
  asset: ImportedAsset;
}

const acl: SenderACL = [["popup"], ["web-view", ["expanded"], "all"]];

export function registerResponder(handler: (data: Request) => Promise<ImportNewAssetResult>) {
  return registerQueryResponder<Request, ImportNewAssetResult>(topic, acl, event => handler(event.data));
}

export async function perform(asset: ImportedAsset) {
  return await sendQuery<Request, ImportNewAssetResult>(topic, "internal", { asset });
}
