import { useMemo } from "react";

import { extractAssetKeyDetails, getNetworkDefinitionFromIdentifier, getAssetDefinitionFromIdentifier } from "common/utils";
import { DEFAULT_DECIMALS, networkNativeCurrencyData } from "common/config";

import { FlatTokenBalanceInfo } from "ui/types";

import { useActiveAccountBalanceOfAsset, useImportedAsset } from "../states";
import { useRPCContractTokenMetadata } from "../rpc";

export function useMaterializedFlatTokenBalanceInfoFromAssetKey(assetKey: string): FlatTokenBalanceInfo;
export function useMaterializedFlatTokenBalanceInfoFromAssetKey(assetKey: string | null | undefined): FlatTokenBalanceInfo | null;
export function useMaterializedFlatTokenBalanceInfoFromAssetKey(assetKey: string | null | undefined): FlatTokenBalanceInfo | null {
  const importedAsset = useImportedAsset(assetKey);

  const assetFromRPC = useRPCContractTokenMetadata(assetKey, { disable: !!importedAsset });

  const balanceInfo = useActiveAccountBalanceOfAsset(assetKey);

  const balance = balanceInfo?.balance ?? "0";
  const balanceUSDValue = balanceInfo?.balanceUSDValue ?? null;

  return useMemo<FlatTokenBalanceInfo | null>(() => {
    if (!assetKey) return null;

    const { networkIdentifier, assetIdentifier } = extractAssetKeyDetails(assetKey);

    const assetDefinition = getAssetDefinitionFromIdentifier(assetIdentifier);

    const nativeAsset = assetDefinition.type === "native" ? networkNativeCurrencyData[networkIdentifier] : null;

    const tokenAsset = importedAsset?.type === "token" ? importedAsset : null;

    const assetMetadataSource = nativeAsset ?? tokenAsset ?? assetFromRPC;

    const result: FlatTokenBalanceInfo = {
      key: assetKey,
      ...assetDefinition,
      networkIdentifier,
      assetIdentifier,
      ...getNetworkDefinitionFromIdentifier(networkIdentifier),
      visibility: importedAsset?.visibility ?? "default",
      verified: tokenAsset?.verified ?? false,
      autoImported: importedAsset?.autoImported ?? false,
      symbol: assetMetadataSource?.symbol ?? "",
      name: assetMetadataSource?.name ?? "",
      decimals: assetMetadataSource?.decimals ?? DEFAULT_DECIMALS,
      balance,
      balanceUSDValue,
    };

    return result;
  }, [assetFromRPC, assetKey, balance, balanceUSDValue, importedAsset]);
}
