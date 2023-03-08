import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";

import { EVMProvider, ProviderManager } from "common/wallet";

import { ERC20__factory } from "common/wallet/typechain";

import { BlockchainNetwork } from "common/types";

import { useNetworkByIdentifier } from "../states";

export function useTokenBalance(tokenAddress: string | null, networkIdentifier: string | null, accountAddress: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const network = useNetworkByIdentifier(networkIdentifier);

  const [tokenBalance, setTokenBalance] = useState<BigNumber>(ethers.constants.Zero);

  useEffect(() => {
    let mounted = true;

    const rpcRequest = async (tokenAddress: string, network: BlockchainNetwork, accountAddress: string) => {
      if (mounted) {
        setLoading(true);
        setTokenBalance(ethers.constants.Zero);
        setError(null);
      }

      if (network) {
        try {
          const { provider } = ProviderManager.getProvider(network) as EVMProvider;

          const erc20 = ERC20__factory.connect(tokenAddress, provider);

          const balance = await erc20.balanceOf(accountAddress);

          if (mounted) {
            setTokenBalance(balance);
          }
        } catch (error) {
          if (mounted) {
            setError(error.message);
          }
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    if (tokenAddress && network && accountAddress) {
      rpcRequest(tokenAddress, network, accountAddress);
    }

    return () => {
      mounted = false;
    };
  }, [network, accountAddress, tokenAddress]);

  return { loading, error, tokenBalance };
}
