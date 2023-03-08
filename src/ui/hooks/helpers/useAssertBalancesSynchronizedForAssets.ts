import { useEffect, useRef } from "react";
import compact from "lodash/compact";
import isEqual from "lodash/isEqual";

import { Balances } from "common/operations";

/**
 * This method forcefully synchronizes the balances for the target asset(s). However, this should be used sparsely as it
 * bypasses the rate-limit protections to ensure that the balances are instantly synchronized for the assets in question.
 * @param assetKeys The key of the target asset or a list of asset keys
 */
export function useAssertBalancesSynchronizedForAssets(assetKeys: string | null | undefined | (string | null | undefined)[]) {
  // This is used to ensure that we only force synchronize the assets when the "sequence" of keys is changed, not
  // when the "instance" of the array changes (in case of list). This prevents needless re-checks which can potentially
  // lead to rate-limits by the providers.
  const previousTargets = useRef<string[]>([]);

  useEffect(() => {
    const currentTargets = Array.isArray(assetKeys) ? compact(assetKeys) : assetKeys ? [assetKeys] : [];

    if (!isEqual(previousTargets.current, currentTargets)) {
      previousTargets.current = currentTargets;

      if (currentTargets.length > 0) {
        Balances.ForceSync.perform(currentTargets);
      }
    }
  }, [assetKeys]);
}
