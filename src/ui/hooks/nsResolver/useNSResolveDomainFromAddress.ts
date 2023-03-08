import { useEffect, useState } from "react";

import { NSResolver } from "common/operations";

import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config";
import { createNetworkIdentifier } from "common/utils";

import { isEthereumAddress } from "ui/common/validators";

export function useNSResolveDomainFromAddress({
  address,
  networkIdentifier = createNetworkIdentifier("evm", ETHEREUM_MAINNET_CHAIN_ID),
}: {
  address?: string | null;
  networkIdentifier?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [domain, setDomain] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolve = async () => {
      if (address && isEthereumAddress(address) && networkIdentifier) {
        if (mounted) {
          setLoading(true);
        }

        const result = await NSResolver.ResolveDomainFromAddress.perform({ address, networkIdentifier });

        if (mounted) {
          setDomain(result.domain);
          setLoading(false);
        }
      }
    };

    resolve();

    return () => {
      mounted = false;
    };
  }, [address, networkIdentifier]);

  return { loading, domain };
}
