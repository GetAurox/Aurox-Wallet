import { PersistentHistory } from "./PersistentHistory";

export function createHistoryStateUpdater(history: PersistentHistory) {
  return function historyStateUpdater<T>(topic: string, recipe: (draft: T) => void) {
    history.updateCurrentState(draft => {
      draft[topic] = recipe(draft[topic]);
    });
  };
}

export function createHistoryStateStasher(history: PersistentHistory) {
  return function historyStateStasher<T>(topic: string, stash: T) {
    history.updateCurrentStateSilently(draft => {
      draft[topic] = stash;
    });
  };
}

export function createHistoryStateStashPopper(history: PersistentHistory) {
  return function historyStateStashPopper<T>(topic: string): NonNullable<T> | null {
    const stash = history.getCurrentState()?.[topic] ?? null;

    if (stash) {
      history.updateCurrentStateSilently(draft => {
        delete draft[topic];
      });
    }

    return stash;
  };
}
