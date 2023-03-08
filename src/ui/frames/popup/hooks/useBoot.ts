import { useEffect, useRef, useState } from "react";

import { useOpenOnboarding } from "ui/hooks/onboarding";

import { useHistoryLocationGetter, useHistoryReset } from "ui/common/history";
import {
  usePasswordStateAssertReady,
  useWalletStateAssertReady,
  useNetworkStateAssertReady,
  useDappStateAssertReady,
  useDAppOperationsStateAssertReady,
  useBalancesStateAssertReady,
  useIsWalletSetup,
  useHasPassword,
  useIsPasswordVerified,
} from "ui/hooks";

export function useBoot() {
  const reset = useHistoryReset();
  const getLocation = useHistoryLocationGetter();

  const passwordStateReady = usePasswordStateAssertReady();
  const walletStateReady = useWalletStateAssertReady();
  const networkStateReady = useNetworkStateAssertReady();
  const dAppStateReady = useDappStateAssertReady();
  const dAppOperationsStateReady = useDAppOperationsStateAssertReady();
  const balancesStateReady = useBalancesStateAssertReady();

  const hasPassword = useHasPassword();
  const isPasswordVerified = useIsPasswordVerified();

  const isWalletSetup = useIsWalletSetup();

  const { openOnboarding } = useOpenOnboarding();

  const loading =
    !passwordStateReady || !walletStateReady || !networkStateReady || !dAppStateReady || !dAppOperationsStateReady || !balancesStateReady;

  const bootStartedRef = useRef(false);

  const [bootFinished, setBootFinished] = useState(false);

  useEffect(() => {
    if (loading || bootStartedRef.current) {
      return;
    }

    bootStartedRef.current = true;

    const location = getLocation();

    if (!hasPassword || !isWalletSetup) {
      try {
        openOnboarding();
      } catch (error) {
        console.error("Failed to open on-boarding page:", error);

        reset("/setup-wallet");
      }
    } else if (!isPasswordVerified) {
      reset("/login");
    } else if (location?.pathname === "/login" || location?.pathname === "/setup-wallet") {
      reset("/");
    }

    setBootFinished(true);
  }, [openOnboarding, reset, loading, hasPassword, isPasswordVerified, isWalletSetup, getLocation]);

  return { ready: !loading && bootFinished };
}
