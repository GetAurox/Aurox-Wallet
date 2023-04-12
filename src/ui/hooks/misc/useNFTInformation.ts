import { useEffect, useState } from "react";

import { getNFTMetadata, getNFTContractType } from "common/wallet";

import { NFTInformation } from "ui/types";

import { BlockchainNetwork } from "common/types";

import { useNetworkByIdentifier } from "../states";

const localCache = new Map<string, NFTInformation>();

export function useNFTInformation(
  tokenAddress: string | null,
  accountAddress: string | null,
  tokenId: string | null,
  networkIdentifier: string | null,
) {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const network = useNetworkByIdentifier(networkIdentifier);

  const [tokenInformation, setTokenInformation] = useState<NFTInformation | null>(null);

  useEffect(() => {
    let mounted = true;

    const rpcRequest = async (tokenAddress: string, address: string, tokenId: string, network: BlockchainNetwork) => {
      const cacheKey = `${tokenAddress}-${tokenId}`;

      if (localCache.has(cacheKey)) {
        setLoading(false);
        setTokenInformation(localCache.get(cacheKey) as NFTInformation);
        setError(null);

        return;
      }

      if (mounted) {
        setLoading(true);
        setTokenInformation(null);
        setError(null);
      }

      try {
        const contractType = await getNFTContractType(tokenAddress, address, tokenId, network);

        if (!mounted) return;

        if (contractType) {
          const metadata = await getNFTMetadata(tokenAddress, tokenId, network);

          if (!mounted) return;
          const information = {
            contractType: contractType,
            metadata,
          };

          setTokenInformation(information);

          localCache.set(cacheKey, information);
        } else {
          if (!mounted) return;

          setTokenInformation({
            contractType: null,
            metadata: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setError(error.message);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    if (tokenAddress && network && tokenId && accountAddress) {
      rpcRequest(tokenAddress, accountAddress, tokenId, network);
    }

    return () => {
      mounted = false;
    };
  }, [accountAddress, network, tokenAddress, tokenId]);

  return { loading, error, tokenInformation };
}
