import { useMemo } from "react";

import { TokenDisplayWithTicker } from "ui/types";

import { useMaterializedFlatTokenBalanceInfoFromAssetKey } from "../helpers";

import { useApplyTokenDisplayMarketTicker } from "./useApplyTokenDisplayMarketTicker";
import { useTokensDisplayWithTickers } from "./useTokensDisplayWithTickers";

/**
 * Provides all available information about the asset.
 * @param assetKey The asset key to acquire the information for
 * @returns All the available information that we have including blockchain ticker,
 * display info, balance and market ticker
 */
export function useTokenAssetTicker(assetKey: string): TokenDisplayWithTicker;
export function useTokenAssetTicker(assetKey: string | null | undefined): TokenDisplayWithTicker | null;
export function useTokenAssetTicker(assetKey: string | null | undefined): TokenDisplayWithTicker | null {
  const materialized = useMaterializedFlatTokenBalanceInfoFromAssetKey(assetKey);

  const memoized = useMemo(() => (materialized ? [materialized] : []), [materialized]);

  const displayWithTicker = useTokensDisplayWithTickers(memoized)[0] ?? null;

  // Apply market tickers service results if available, market tickers are much more reliable and responsive
  return useApplyTokenDisplayMarketTicker(displayWithTicker);
}
