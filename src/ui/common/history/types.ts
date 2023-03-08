import { To } from "history";

import { PersistentHistory } from "./PersistentHistory";

export type HistoryStateSetter<T> = (value: T | ((old: T) => T)) => void;

export interface HistoryNavigationInterceptorEventActionGoBack {
  type: "go-back";
}

export interface HistoryNavigationInterceptorEventActionResetOrPush {
  type: "reset" | "push";
  to: To;
  state?: any;
}

export type HistoryNavigationInterceptorEventAction =
  | HistoryNavigationInterceptorEventActionGoBack
  | HistoryNavigationInterceptorEventActionResetOrPush;

export interface HistoryNavigationInterceptorEvent {
  history: PersistentHistory;
  updateCurrentState: <T>(topic: string, recipe: (draft: T) => void) => void;
  stashState: <T>(topic: string, stash: T) => void;
  preventDefault: () => void;
  defaultPrevented: boolean;
  action: HistoryNavigationInterceptorEventAction;
}

export type HistoryNavigationInterceptor = (event: HistoryNavigationInterceptorEvent) => void;
