import { useState, useEffect } from "react";

import { extractAssetKeyDetails, getNetworkDefinitionFromIdentifier, getAssetDefinitionFromIdentifier } from "common/utils";

import { useNetworkGetter } from "../states";

import { resolvers, RPCTokenMetadata } from "./resolvers";

export function useRPCContractTokenMetadata(assetKey: string | null | undefined, options?: { disable?: boolean }) {
  const [metadata, setMetadata] = useState<RPCTokenMetadata | null>(null);

  const networkGetter = useNetworkGetter();

  useEffect(() => {
    let canceled = false;

    const resolve = async () => {
      if (!assetKey || options?.disable) return;

      try {
        const { assetIdentifier, networkIdentifier } = extractAssetKeyDetails(assetKey);

        const assetDefinition = getAssetDefinitionFromIdentifier(assetIdentifier);

        if (assetDefinition.type !== "contract") return;

        const network = networkGetter(networkIdentifier);

        if (!network) return;

        const { chainType } = getNetworkDefinitionFromIdentifier(networkIdentifier);

        const metadata = await resolvers[chainType].resolveTokenMetadata(network, assetDefinition.contractAddress);

        if (canceled) return;

        setMetadata(metadata);
      } catch (error) {
        console.error(`Failed to resolve metadata for token with assetKey="${assetKey}"`, error);

        if (canceled) return;

        setMetadata(null);
      }
    };

    resolve();

    return () => {
      canceled = true;
    };
  }, [assetKey, networkGetter, options?.disable]);

  return metadata;
}
