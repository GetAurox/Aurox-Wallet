import { useMemo } from "react";

import { TokenDisplay } from "ui/types";

import { useMaterializedFlatTokenBalanceInfoFromAssetKey } from "../helpers";

import { useTokensDisplay } from "./useTokensDisplay";

/**
 * A unifying hook that requires only asset key to provide basic display information
 * on the target asset such as display info and balance
 */
export function useTokenAssetDisplay(assetKey: string): TokenDisplay;
export function useTokenAssetDisplay(assetKey: string | null | undefined): TokenDisplay | null;
export function useTokenAssetDisplay(assetKey: string | null | undefined): TokenDisplay | null {
  const materialized = useMaterializedFlatTokenBalanceInfoFromAssetKey(assetKey);

  const memoized = useMemo(() => (materialized ? [materialized] : []), [materialized]);

  return useTokensDisplay(memoized)[0] ?? null;
}
