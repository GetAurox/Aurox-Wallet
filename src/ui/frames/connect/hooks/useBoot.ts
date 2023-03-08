import { useEffect, useRef, useState } from "react";

import { useHistoryReset } from "ui/common/history";

import {
  usePasswordStateAssertReady,
  useWalletStateAssertReady,
  useDappStateAssertReady,
  useDAppOperationsStateAssertReady,
  useIsWalletSetup,
  useHasPassword,
  useIsPasswordVerified,
  useOpenOnboarding,
} from "ui/hooks";

export function useBoot() {
  const reset = useHistoryReset();

  const passwordStateReady = usePasswordStateAssertReady();
  const walletStateReady = useWalletStateAssertReady();
  const dAppStateReady = useDappStateAssertReady();
  const dAppOperationsStateReady = useDAppOperationsStateAssertReady();

  const hasPassword = useHasPassword();
  const isPasswordVerified = useIsPasswordVerified();

  const isWalletSetup = useIsWalletSetup();

  const { openOnboarding } = useOpenOnboarding();

  const loading = !passwordStateReady || !walletStateReady || !dAppStateReady || !dAppOperationsStateReady;

  const bootStartedRef = useRef(false);

  const [bootFinished, setBootFinished] = useState(false);

  useEffect(() => {
    if (loading || bootStartedRef.current) {
      return;
    }

    bootStartedRef.current = true;

    if (!hasPassword || !isWalletSetup) {
      try {
        const open = async () => {
          await openOnboarding();
          window.close();
        };

        open();
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
  }, [hasPassword, isPasswordVerified, isWalletSetup, loading, openOnboarding, reset]);

  return { ready: !loading && bootFinished };
}
