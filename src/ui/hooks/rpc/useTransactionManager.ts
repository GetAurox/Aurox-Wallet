import noop from "lodash/noop";

import { useState, useEffect, useMemo } from "react";

import { AccountInfo, RawTransaction } from "common/types";
import { EVMTransactionService, getEVMTransactionService } from "common/transactions";

import { useActiveAccountBalanceOfNativeAsset, useNetworkGetter } from "../states";

import { useLocalUserPreferences } from "../storage";

export function useTransactionManager(
  account: AccountInfo | null | undefined,
  networkIdentifier: string | null | undefined,
  transaction: RawTransaction | null | undefined,
  nonce?: number,
) {
  const [service, setService] = useState<EVMTransactionService>();

  const [userPreferences] = useLocalUserPreferences();

  const nativeBalance = useActiveAccountBalanceOfNativeAsset(networkIdentifier);

  const { general } = userPreferences;

  const gasPresets = useMemo(() => {
    if (!general || !general.gasPresets || !networkIdentifier) {
      return;
    }

    return general.gasPresets[networkIdentifier];
  }, [general, networkIdentifier]);

  const networkGetter = useNetworkGetter();

  useEffect(() => {
    let cleanup = noop;
    let mounted = true;

    const resolve = async () => {
      if (!account || !transaction || !nativeBalance) return;

      try {
        const network = networkGetter(networkIdentifier);

        if (!network) return;

        const service = await getEVMTransactionService({
          transaction,
          account,
          network,
          userBalance: nativeBalance.balance,
          gasOptions: { presets: gasPresets },
        });

        if (mounted && service) {
          setService(service);
        }

        cleanup = () => service.cancelUpdate?.();
      } catch (error) {
        console.error(error);

        if (mounted) {
          setService(undefined);
        }
      }
    };

    resolve();

    return () => {
      if (cleanup) cleanup();

      mounted = false;
    };
  }, [account, transaction, networkGetter, networkIdentifier, nonce, gasPresets, nativeBalance]);

  return service;
}
