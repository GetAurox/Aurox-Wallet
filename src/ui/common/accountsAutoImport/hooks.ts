import { useContext } from "react";

import { AccountsAutoImportContext } from "./AccountsAutoImportContext";

export function useAccountsAutoImportContext() {
  return useContext(AccountsAutoImportContext);
}
