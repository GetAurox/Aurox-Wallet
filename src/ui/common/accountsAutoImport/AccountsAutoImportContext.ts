import { createContext } from "react";
import noop from "lodash/noop";

import { AccountsAutoImportContextValue } from "./types";

export const AccountsAutoImportContext = createContext<AccountsAutoImportContextValue>({
  started: false,
  finished: false,
  notified: false,
  setNotified: noop,
});
