import { createAddStorageChangeListener } from "../utils";

const topic = "favorite_assets";

/**
 * Array of assetIds which correspond to assets that we track via exchange metadata service
 */
export type FavoriteAssets = number[];

export const defaultFavoriteAssets: FavoriteAssets = [
  6231, // URUS
  175, // WBTC
  162, // WETH
  164, // USDT
];

export async function saveFavoriteAssetsToSyncArea(favorites: FavoriteAssets) {
  await chrome.storage.sync.set({ [topic]: favorites });
}

export async function loadFavoriteAssetsFromSyncArea(): Promise<FavoriteAssets | null> {
  const { [topic]: result } = await chrome.storage.sync.get(topic);

  return result ?? null;
}

export const addListenerOnSyncAreaForFavoriteAssets = createAddStorageChangeListener<FavoriteAssets>(topic, "sync");
