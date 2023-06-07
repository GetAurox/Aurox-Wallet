import { useMemo } from "react";

import { useMaterializedFlatTokenBalanceInfoFromAssetKey, useTokensDisplayWithTickers } from "ui/hooks";
import { TokenDisplayWithTicker } from "ui/types";

export function useSendTokenAssetTicker(assetKey: string | null | undefined): TokenDisplayWithTicker | null {
  const materialized = useMaterializedFlatTokenBalanceInfoFromAssetKey(assetKey);

  const memoized = useMemo(() => (materialized ? [materialized] : []), [materialized]);

  const displayWithTicker = useTokensDisplayWithTickers(memoized)[0] ?? null;

  return displayWithTicker;
}
