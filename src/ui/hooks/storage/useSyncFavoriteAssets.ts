import { useMemo, useCallback } from "react";
import isEqual from "lodash/isEqual";

import {
  loadFavoriteAssetsFromSyncArea,
  saveFavoriteAssetsToSyncArea,
  defaultFavoriteAssets,
  addListenerOnSyncAreaForFavoriteAssets,
} from "common/storage";

import { makeStorageHook } from "./makeStorageHook";

export const useSyncFavoriteAssets = makeStorageHook(loadFavoriteAssetsFromSyncArea, saveFavoriteAssetsToSyncArea, defaultFavoriteAssets, {
  throttleSave: true,
  addChangeListener: addListenerOnSyncAreaForFavoriteAssets,
  areEqual: isEqual,
});

export function useAssetFavoriteStateGetter() {
  const [favoriteAssets] = useSyncFavoriteAssets();

  return useCallback(
    (assetId: number | null | undefined) => {
      if (typeof assetId !== "number") return false;

      return favoriteAssets.some(favorite => favorite === assetId);
    },
    [favoriteAssets],
  );
}

export function useAssetFavoriteState(assetId: number | null | undefined) {
  const [favoriteAssets, setFavoriteAssets] = useSyncFavoriteAssets();

  const isFavorite = useMemo(() => {
    if (typeof assetId !== "number") return false;

    return favoriteAssets.some(favorite => favorite === assetId);
  }, [favoriteAssets, assetId]);

  const setIsFavorite = useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      if (typeof assetId !== "number") return;

      setFavoriteAssets(oldFavorites => {
        const currentTargetvalue = oldFavorites.some(favorite => favorite === assetId);

        const newValue = typeof value === "function" ? value(currentTargetvalue) : value;

        if (currentTargetvalue === newValue) {
          return oldFavorites;
        }

        return newValue ? [...oldFavorites, assetId] : oldFavorites.filter(favorite => favorite !== assetId);
      });
    },
    [assetId, setFavoriteAssets],
  );

  return [isFavorite, setIsFavorite] as const;
}
