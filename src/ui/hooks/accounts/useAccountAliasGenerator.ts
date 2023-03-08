import { useCallback } from "react";

import { useAccounts } from "../states";

export function useAccountAliasGenerator() {
  const accounts = useAccounts();

  return useCallback(() => {
    let maxAccountNumber = 0;

    for (const account of Object.values(accounts ?? {})) {
      const match = /^account\s+(\d+)$/gim.exec(account.alias);

      if (match?.[1]) {
        const num = Number(match[1]);

        if (Number.isFinite(num)) {
          maxAccountNumber = Math.max(maxAccountNumber, num);
        }
      }
    }

    return `Account ${maxAccountNumber + 1}`;
  }, [accounts]);
}
