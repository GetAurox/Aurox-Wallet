import { useCallback, useMemo } from "react";

import isEqual from "lodash/isEqual";

import { SecureImportedAssetState } from "common/states";
import { ImportedAsset } from "common/types";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

import { useEnabledNetworks } from "./network";

type EnabledNetworksAssetsGetter = (assets: ImportedAsset[]) => ImportedAsset[] | null;

export const useImportedAssetState = makeStateConsumerHook(SecureImportedAssetState.buildConsumer());

export const useImportedAssetStateAssertReady = makeConsumerReadyAsserterHook(useImportedAssetState);

export function useImportedAssets() {
  const enabledNetworksAssetsGetter = useEnabledNetworksAssetsGetter();

  const selector = useCallback(
    (data: SecureImportedAssetState.Data) => {
      return assetsSelector(data, enabledNetworksAssetsGetter) ?? null;
    },
    [enabledNetworksAssetsGetter],
  );

  return useImportedAssetState(selector, isEqual);
}

export function useImportedAsset(assetKey: string | undefined | null) {
  const selector = useCallback(
    (data: SecureImportedAssetState.Data) => {
      if (!assetKey) return null;

      return data?.assets?.find(asset => asset.key === assetKey) ?? null;
    },
    [assetKey],
  );

  return useImportedAssetState(selector, isEqual);
}

function useEnabledNetworksAssetsGetter() {
  const enabledNetworks = useEnabledNetworks();

  const enabledNetworksIdentifiersSet = useMemo(() => new Set(enabledNetworks?.map(network => network.identifier)), [enabledNetworks]);

  return useCallback(
    (assets: ImportedAsset[]) => {
      return enabledNetworksIdentifiersSet.size !== 0
        ? assets.filter(asset => enabledNetworksIdentifiersSet.has(asset.networkIdentifier))
        : null;
    },
    [enabledNetworksIdentifiersSet],
  );
}

const assetsSelector = (data: SecureImportedAssetState.Data, enabledNetworksAssetsGetter: EnabledNetworksAssetsGetter) =>
  enabledNetworksAssetsGetter(data.assets);
