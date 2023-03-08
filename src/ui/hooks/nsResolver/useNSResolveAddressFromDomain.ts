import { useEffect, useState } from "react";

import { NSResolver } from "common/operations";
import { UNSDomainRecordType } from "common/types";
import { createNetworkIdentifier } from "common/utils";
import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config";

import { isDomainName } from "ui/common/validators";

export function useNSResolveAddressFromDomain({
  unsDomainRecordType,
  domain,
  networkIdentifier = createNetworkIdentifier("evm", ETHEREUM_MAINNET_CHAIN_ID),
}: {
  unsDomainRecordType: UNSDomainRecordType;
  domain?: string | null;
  networkIdentifier?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolve = async () => {
      if (domain && isDomainName(domain) && networkIdentifier) {
        if (mounted) {
          setLoading(true);
        }

        const result = await NSResolver.ResolveAddressFromDomain.perform({ unsDomainRecordType, domain, networkIdentifier });

        if (mounted) {
          setAddress(result.address);
          setLoading(false);
        }
      }
    };

    resolve();

    return () => {
      mounted = false;
    };
  }, [unsDomainRecordType, domain, networkIdentifier]);

  return { loading, address };
}
