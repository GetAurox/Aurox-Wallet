import { useMemo } from "react";

import { createAssetKey, getAssetIdentifierFromDefinition, getNetworkDefinitionFromIdentifier } from "common/utils";
import { networkNativeCurrencyData } from "common/config";
import { AssetDefinition } from "common/types";

import { useTicker } from "ui/common/connections";
import { TokenTicker } from "ui/types";

/**
 * Helper hook to easily access ticker information on native asset of the given network that is supported by
 * our market tickers service
 */
export function useNativeTokenMarketTicker(networkIdentifier: string) {
  const targetPairId = networkNativeCurrencyData[networkIdentifier]?.pairId ?? null;

  const ticker = useTicker(targetPairId);

  return useMemo<TokenTicker>(() => {
    const assetDefinition: AssetDefinition = { type: "native" };
    const assetIdentifier = getAssetIdentifierFromDefinition(assetDefinition);

    const networkDefinition = getNetworkDefinitionFromIdentifier(networkIdentifier);

    return {
      key: createAssetKey(networkIdentifier, assetIdentifier),
      networkIdentifier,
      assetIdentifier,
      assetDefinition,
      networkDefinition,
      pairId: targetPairId,
      priceUSD: typeof ticker?.price === "number" ? String(ticker.price) : null,
      priceChange24HPercent: typeof ticker?.change24HPercent === "number" ? String(ticker.change24HPercent) : null,
      priceUSDChange24H: typeof ticker?.change24H === "number" ? String(ticker.change24H) : null,
      volumeUSD24H: typeof ticker?.volume24H === "number" ? String(ticker.volume24H) : null,
    };
  }, [networkIdentifier, targetPairId, ticker]);
}
