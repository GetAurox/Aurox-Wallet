import { ImportedAsset } from "common/types";

import { ImportedAssetUpdate } from "./types";

export function applyImportedAssetUpdates(draft: ImportedAsset[], updates: ImportedAssetUpdate[]) {
  for (const [key, type, payload] of updates) {
    for (const asset of draft) {
      if (asset.key === key && asset.type === type) {
        Object.assign(asset, payload);
      }
    }
  }
}
