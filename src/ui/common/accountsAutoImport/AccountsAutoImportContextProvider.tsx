import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

import { loadAccountsAutoImportLastCheckTimestampFromLocalArea, saveAccountsAutoImportLastCheckTimestampToLocalArea } from "common/storage";
import { ACCOUNTS_AUTO_IMPORT_EXPIRATION } from "common/config";

import { detectMainAccountsWithTx } from "ui/common/utils";

import { useHasPassword, useIsPasswordVerified, useIsWalletSetup, useWalletSetupMethod } from "../../hooks/states";

import { AccountsAutoImportContextValue } from "./types";
import { AccountsAutoImportContext } from "./AccountsAutoImportContext";

export interface AccountsAutoImportContextProviderProps {
  children?: ReactNode;
}

export function AccountsAutoImportContextProvider(props: AccountsAutoImportContextProviderProps) {
  const { children } = props;

  const hasPassword = useHasPassword();
  const isPasswordVerified = useIsPasswordVerified();
  const isWalletSetup = useIsWalletSetup();
  const walletSetupMethod = useWalletSetupMethod();

  const [autoImportNeeded, setAutoImportNeeded] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [notified, setNotified] = useState(false);

  const processing = useRef(false);

  useEffect(() => {
    let mounted = true;

    const processNeed = async () => {
      const lastDone = await loadAccountsAutoImportLastCheckTimestampFromLocalArea();

      if (!mounted) {
        return;
      }

      // If user was notified once previously, no need to notify him again
      if (lastDone !== null) {
        setNotified(true);
      }

      /*
        If wallet is just set up using "create" method (not "import")
        no need to do initial auto-import as it is typically nothing to import
      */
      if (!lastDone) {
        if (walletSetupMethod !== "create") {
          setAutoImportNeeded(true);
        }

        return;
      }

      if (Date.now() - lastDone > ACCOUNTS_AUTO_IMPORT_EXPIRATION) {
        setAutoImportNeeded(true);
      }
    };

    if (hasPassword && isPasswordVerified && isWalletSetup) {
      processNeed();
    }

    return () => {
      mounted = false;
    };
  }, [hasPassword, isPasswordVerified, isWalletSetup, walletSetupMethod]);

  useEffect(() => {
    let mounted = true;

    const abortController = new AbortController();

    const processImport = async () => {
      mounted && setStarted(true);

      await detectMainAccountsWithTx({ signal: abortController.signal });

      await saveAccountsAutoImportLastCheckTimestampToLocalArea(Date.now());

      mounted && setFinished(true);
    };

    if (autoImportNeeded && !processing.current) {
      processing.current = true;

      processImport();
    }

    return () => {
      mounted = false;

      abortController.abort();
    };
  }, [autoImportNeeded]);

  const value = useMemo<AccountsAutoImportContextValue>(
    () => ({ started, finished, notified, setNotified }),
    [started, finished, notified, setNotified],
  );

  return <AccountsAutoImportContext.Provider value={value}>{children}</AccountsAutoImportContext.Provider>;
}
