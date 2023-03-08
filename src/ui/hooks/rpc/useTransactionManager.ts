import { useState, useEffect } from "react";

import noop from "lodash/noop";

import { EVMSignerPopup, PopupSignerManager } from "ui/common/connections";
import { AccountInfo, RawTransaction } from "common/types";

import { EVMTransactionManager } from "ui/common/transactions/transactionManagerV2";

import { useNetworkGetter } from "../states";

export function useTransactionManager(
  account: AccountInfo | null | undefined,
  networkIdentifier: string | null,
  transaction: RawTransaction | null,
  nonce?: number,
) {
  const [manager, setManager] = useState<EVMTransactionManager | null>(null);

  const networkGetter = useNetworkGetter();

  useEffect(() => {
    let cleanup = noop;

    const resolve = async () => {
      if (!account || !transaction) return;

      try {
        const network = networkGetter(networkIdentifier);

        if (!network) return;

        const signer = PopupSignerManager.getSigner(account, network) as EVMSignerPopup;
        const manager = await new EVMTransactionManager(transaction, signer).withFees();

        setManager(manager);

        cleanup = () => manager.cancelFeeUpdate();
      } catch (error) {
        console.error(error);

        setManager(null);
      }
    };

    resolve();

    return () => {
      if (cleanup) cleanup();
    };
  }, [account, transaction, networkGetter, networkIdentifier, nonce]);

  return manager;
}
