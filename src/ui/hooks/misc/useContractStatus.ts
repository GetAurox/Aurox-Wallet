import { useState, useEffect } from "react";

import { verifyContract, SmartContractStatus } from "@aurox/smart-contract-monitoring";

import { getNetworkDefinitionFromIdentifier } from "common/utils";

export function useContractStatus(contractAddress: string, networkIdentifier: string) {
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<SmartContractStatus | null | undefined>();

  useEffect(() => {
    let mounted = true;

    const fetch = async (address: string) => {
      if (mounted) {
        setLoading(true);
      }

      const { chainType, chainId } = getNetworkDefinitionFromIdentifier(networkIdentifier);
      const result = await verifyContract(address.toLowerCase(), `${chainType.toUpperCase()}${chainId}`);

      if (mounted) {
        setLoading(false);
        setStatus(result);
      }
    };

    fetch(contractAddress);

    return () => {
      mounted = false;
    };
  }, [contractAddress, networkIdentifier]);

  return { loading, status };
}
