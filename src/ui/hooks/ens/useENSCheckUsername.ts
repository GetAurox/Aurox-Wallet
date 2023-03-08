import { useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { ethers } from "ethers";

import { ENS_SERVICE_URL } from "common/config";

import { trackSentry } from "ui/components/common/Root/sentry";

export function useENSCheckUsername(username: string) {
  const [valid, setValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ error: Error; isAxiosError: boolean }>();

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        if (mounted) {
          setLoading(true);
          setError(undefined);
        }

        const response: AxiosResponse<{
          resolveAddress: null;
        }> = await axios(`${ENS_SERVICE_URL}/api/v1/subdomains/check/${username}`);

        setValid(response.data.resolveAddress === ethers.constants.AddressZero);

        if (mounted) setLoading(false);
      } catch (e) {
        if (mounted) {
          setValid(false);
          setError({ error: e, isAxiosError: axios.isAxiosError(e) });
          trackSentry(e);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (username !== "") {
      fetch();
    }

    return () => {
      mounted = false;
    };
  }, [username]);

  return { valid, loading, error };
}
