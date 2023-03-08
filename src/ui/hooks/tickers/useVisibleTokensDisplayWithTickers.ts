import { useMemo } from "react";
import { applyTokenAssetVisibilityRules } from "common/utils";

import { useAccountFlatTokenBalances } from "../states";

import { useTokensDisplayWithTickers } from "./useTokensDisplayWithTickers";

export function useVisibleTokensDisplayWithTickers(accountUUID: string) {
  const balances = useAccountFlatTokenBalances(accountUUID);

  const visibleBalances = useMemo(() => balances.filter(applyTokenAssetVisibilityRules), [balances]);

  return useTokensDisplayWithTickers(visibleBalances);
}
