import { useEffect, useState } from "react";

import { EVMProvider, ProviderManager } from "common/wallet";

import { EthereumToken } from "ui/types";

import { BlockchainNetwork } from "common/types";

import { useNetworkByIdentifier } from "../states";

export function useTokenInformation(tokenAddress: string | null, networkIdentifier: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const network = useNetworkByIdentifier(networkIdentifier);

  const [tokenInformation, setTokenInformation] = useState<EthereumToken | null>(null);

  useEffect(() => {
    let mounted = true;

    const rpcRequest = async (tokenAddress: string, network: BlockchainNetwork) => {
      if (mounted) {
        setLoading(true);
        setTokenInformation(null);
        setError(null);
      }

      try {
        const provider = ProviderManager.getProvider(network) as EVMProvider;

        const tokenDetails = await provider.getTokenDetails(tokenAddress);

        if (!mounted) return;

        setTokenInformation(tokenDetails);
      } catch (error) {
        if (mounted) {
          setError(error.message);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    if (tokenAddress && network) {
      rpcRequest(tokenAddress, network);
    }

    return () => {
      mounted = false;
    };
  }, [network, tokenAddress]);

  return { loading, error, tokenInformation };
}
