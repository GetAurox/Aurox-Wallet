import { useMemo } from "react";

import { useTicker } from "ui/common/connections";
import { TokenDisplayWithTicker } from "ui/types";

/**
 * Expects a token with blockchain ticker to apply market ticker if available
 */
export function useApplyTokenDisplayMarketTicker(tokenWithTicker: TokenDisplayWithTicker): TokenDisplayWithTicker;
export function useApplyTokenDisplayMarketTicker(tokenWithTicker: TokenDisplayWithTicker | null | undefined): TokenDisplayWithTicker | null;
export function useApplyTokenDisplayMarketTicker(
  tokenWithTicker: TokenDisplayWithTicker | null | undefined,
): TokenDisplayWithTicker | null {
  const ticker = useTicker(tokenWithTicker?.pairId ?? null);

  return useMemo<TokenDisplayWithTicker | null>(() => {
    if (!tokenWithTicker) return null;

    if (!ticker) return tokenWithTicker;

    return {
      ...tokenWithTicker,
      priceUSD: String(ticker.price),
      priceUSDChange24H: String(ticker.change24H),
      priceChange24HPercent: String(ticker.change24HPercent),
      volumeUSD24H: String(ticker.volume24H),
      balanceUSD: Number((Number(tokenWithTicker.balance) * ticker.price).toFixed(2)).toString(),
    };
  }, [ticker, tokenWithTicker]);
}
