export interface AccountsAutoImportContextValue {
  started: boolean;
  finished: boolean;
  notified: boolean;
  setNotified: (notified: boolean) => void;
}
