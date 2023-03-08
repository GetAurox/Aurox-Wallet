import { createContext } from "react";
import noop from "lodash/noop";
import { To } from "history";

import { PersistentHistory } from "./PersistentHistory";
import { HistoryNavigationInterceptor } from "./types";

export interface PersistentHistoryContextState {
  history: PersistentHistory | null;
  reset: (to: To, state?: any) => void;
}

export interface HistoryNavigationInterceptionContextState {
  interceptor: HistoryNavigationInterceptor;
}

export const PersistentHistoryContext = createContext<PersistentHistoryContextState>({
  history: null,
  reset: noop,
});

export const HistoryNavigationInterceptionContext = createContext<HistoryNavigationInterceptionContextState>({
  interceptor: noop,
});
