import { useMemo } from "react";

import { Pair } from "common/wallet";

import { useMaterializedFlatTokenBalanceInfoFromAssetKey, useTokensDisplayWithTickers } from "ui/hooks";
import { TokenDisplayWithTicker } from "ui/types";

export function useSwapTokenPairTickers(assetkeys: Pair<string>): Pair<TokenDisplayWithTicker | null> {
  const materializedFrom = useMaterializedFlatTokenBalanceInfoFromAssetKey(assetkeys.from);
  const materializedTo = useMaterializedFlatTokenBalanceInfoFromAssetKey(assetkeys.to);

  const memoized = useMemo(
    () => [...(materializedFrom ? [materializedFrom] : []), ...(materializedTo ? [materializedTo] : [])],
    [materializedFrom, materializedTo],
  );

  const [fromOrTo, maybeTo] = useTokensDisplayWithTickers(memoized);

  return {
    from: materializedFrom ? fromOrTo : null,
    to: maybeTo ?? (materializedFrom ? null : fromOrTo) ?? null,
  };
}
