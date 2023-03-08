import { ImportedAsset } from "common/types";

const topic = "imported_assets";

export async function saveImportedAssetsToLocalArea(assets: ImportedAsset[]) {
  await chrome.storage.local.set({ [topic]: assets });
}

export async function loadImportedAssetsFromLocalArea(): Promise<ImportedAsset[] | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  return result ?? null;
}
