import { useCallback } from "react";

import { createAssetKey, getAssetIdentifierFromDefinition, getNetworkDefinitionFromIdentifier } from "common/utils";
import { AssetDefinition } from "common/types";
import {
  ETHEREUM_MAINNET_NATIVE_ASSET_PRICING_PAIR_ID,
  ethereumMainnetNetworkIdentifier,
  BINANCE_SMART_CHAIN_NATIVE_ASSET_PRICING_PAIR_ID,
  binanceSmartChainNetworkIdentifier,
} from "common/config";

import { useImperativeTicker } from "ui/common/connections";
import { TokenTicker } from "ui/types";

/**
 * Setup and return a getter function that returns the latest available ticker on native assets that are supported by our
 * market tickers service
 */
export function useNativeTokenImperativeTickers() {
  const ethTicker = useImperativeTicker(ETHEREUM_MAINNET_NATIVE_ASSET_PRICING_PAIR_ID);
  const bnbTicker = useImperativeTicker(BINANCE_SMART_CHAIN_NATIVE_ASSET_PRICING_PAIR_ID);

  return useCallback(
    (networkIdentifier: string): TokenTicker => {
      const ticker =
        networkIdentifier === ethereumMainnetNetworkIdentifier
          ? ethTicker
          : networkIdentifier === binanceSmartChainNetworkIdentifier
          ? bnbTicker
          : null;

      const assetDefinition: AssetDefinition = { type: "native" };
      const assetIdentifier = getAssetIdentifierFromDefinition(assetDefinition);

      const networkDefinition = getNetworkDefinitionFromIdentifier(networkIdentifier);

      return {
        key: createAssetKey(networkIdentifier, assetIdentifier),
        networkIdentifier,
        assetIdentifier,
        assetDefinition,
        networkDefinition,
        pairId: ticker?.pairId ?? null,
        priceUSD: typeof ticker?.current.price === "number" ? String(ticker.current.price) : null,
        priceChange24HPercent: typeof ticker?.current.change24HPercent === "number" ? String(ticker.current.change24HPercent) : null,
        priceUSDChange24H: typeof ticker?.current.change24H === "number" ? String(ticker.current.change24H) : null,
        volumeUSD24H: typeof ticker?.current.volume24H === "number" ? String(ticker.current.volume24H) : null,
      };
    },
    [ethTicker, bnbTicker],
  );
}
