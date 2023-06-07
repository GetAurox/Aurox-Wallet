import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";

import { Wallet } from "common/operations";
import { SCAVENGER_HUNT_URL } from "common/config";
import { tryGetAccountAddressForChainType } from "common/utils";
import { AccountInfo } from "common/types";

export default function useScavengerHuntMnemonic(account: AccountInfo | null, domain: string) {
  const [loading, setLoading] = useState(true);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const fetch = async (uuid: string, address: string) => {
      try {
        setLoading(true);
        setError(null);

        const requestMethod = "GET";
        const requestPath = `/api/v1/url/${domain}`;
        const message = `${requestMethod}${requestPath}{}`;

        const signature = await Wallet.SignMessageV2.perform({
          chainType: "evm",
          message,
          uuid,
          shouldArrayify: false,
        });

        const headers = {
          "x-aurox-signature": signature,
          "x-aurox-address": address,
        };

        const result: AxiosResponse<{ mnemonic: string | null }> = await axios(`${SCAVENGER_HUNT_URL}${requestPath}`, {
          method: requestMethod,
          headers,
          signal,
        });

        if (signal.aborted) return;

        setLoading(false);
        setMnemonic(result.data.mnemonic || null);
      } catch (e) {
        if (!abortController.signal.aborted) {
          setError(e instanceof Error ? e.message : "Unknown error");
          setLoading(false);
        }
      }
    };

    if (account !== null && domain !== "") {
      const address = tryGetAccountAddressForChainType(account, "evm");

      if (address && account.type !== "hardware") {
        fetch(account.uuid, address);
      }
    }
  }, [domain, account]);

  return { mnemonic, error, loading };
}
