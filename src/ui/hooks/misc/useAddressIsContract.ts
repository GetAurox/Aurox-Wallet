import { useEffect, useState } from "react";

import { ProviderManager, addressIsContract } from "common/wallet";
import { BlockchainNetwork } from "common/types";

import { useNetworkByIdentifier } from "../states";

export interface IsContractResponse {
  loading: boolean;
  error: string | null;
  result: boolean | null;
}

export function useAddressIsContract(address: string | null, networkIdentifier: string | null) {
  const [state, setState] = useState<IsContractResponse>({ loading: true, error: null, result: null });
  const providedNetwork = useNetworkByIdentifier(networkIdentifier);

  useEffect(() => {
    let cancelled = false;

    const rpcRequest = async (address: string) => {
      try {
        const provider = ProviderManager.getProvider(providedNetwork as BlockchainNetwork);

        const result = await addressIsContract(provider, address);

        if (cancelled) return;

        setState({
          error: null,
          loading: false,
          result,
        });
      } catch (error) {
        if (cancelled) return;

        setState({
          loading: false,
          error: error.message,
          result: null,
        });
      }
    };

    if (address) {
      if (networkIdentifier && !providedNetwork && !cancelled) {
        setState({
          loading: false,
          error: `Network for ${networkIdentifier} not found`,
          result: null,
        });

        return;
      }
      rpcRequest(address);
    }

    return () => {
      cancelled = true;
    };
  }, [providedNetwork, address, networkIdentifier]);

  return { loading: state.loading, error: state.error, addressIsContract: state.result };
}
