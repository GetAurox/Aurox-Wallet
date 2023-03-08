import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { To } from "history";

import { createHistoryStateUpdater, createHistoryStateStasher, createHistoryStateStashPopper } from "./utils";
import { PersistentHistoryContext, HistoryNavigationInterceptionContext } from "./context";
import { PersistentHistory } from "./PersistentHistory";
import {
  HistoryNavigationInterceptorEventAction,
  HistoryNavigationInterceptorEvent,
  HistoryNavigationInterceptor,
  HistoryStateSetter,
} from "./types";

export function useHistory() {
  const { history } = useContext(PersistentHistoryContext);

  return history;
}

export function useHistoryNavigationInterceptor() {
  const { interceptor } = useContext(HistoryNavigationInterceptionContext);

  return interceptor;
}

export function useHistoryPathParams<T extends string = string>(): Record<T, string | undefined> {
  // a wrapper so we can abstract it away to allow easy modifications in the future
  return useParams() as Record<T, string | undefined>;
}

export function useHistorySearchParamGetter() {
  // a wrapper so we can abstract it away to allow easy modifications in the future
  const [params] = useSearchParams();

  return useCallback((key: string) => params.get(key), [params]);
}

export function useHistoryGoBackOrReset() {
  const history = useHistory();

  const interceptor = useHistoryNavigationInterceptor();

  return useCallback(
    (to: To, state?: any) => {
      if (!history) {
        return;
      }

      const shouldReset = history.index === 0;

      if (shouldReset) {
        const { defaultPrevented } = dispatchNavigationInterceptorEvent(history, interceptor, { type: "reset", to, state });

        if (!defaultPrevented) {
          history.reset(to, state);
        }

        return;
      }

      const { defaultPrevented } = dispatchNavigationInterceptorEvent(history, interceptor, { type: "go-back" });

      if (!defaultPrevented) {
        history.back();
      }
    },
    [history, interceptor],
  );
}

export function useHistoryGoBack() {
  const history = useHistory();

  const interceptor = useHistoryNavigationInterceptor();

  return useCallback(() => {
    if (!history) {
      return;
    }

    const { defaultPrevented } = dispatchNavigationInterceptorEvent(history, interceptor, { type: "go-back" });

    if (!defaultPrevented) {
      history.back();
    }
  }, [history, interceptor]);
}

export function useHistoryPush() {
  const history = useHistory();

  const interceptor = useHistoryNavigationInterceptor();

  return useCallback(
    (to: To, state?: any) => {
      if (!history) {
        return;
      }

      const { defaultPrevented } = dispatchNavigationInterceptorEvent(history, interceptor, { type: "push", to, state });

      if (!defaultPrevented) {
        history.push(to, state);
      }
    },
    [history, interceptor],
  );
}

export function useHistoryReset() {
  const { reset, history } = useContext(PersistentHistoryContext);

  const interceptor = useHistoryNavigationInterceptor();

  return useCallback(
    (to: To, state?: any) => {
      if (!history) {
        return;
      }

      const { defaultPrevented } = dispatchNavigationInterceptorEvent(history, interceptor, { type: "reset", to, state });

      if (!defaultPrevented) {
        reset(to, state);
      }
    },
    [reset, history, interceptor],
  );
}

export function useHistoryState<T>(topic: string, defaultValue: T): [T, HistoryStateSetter<T>] {
  const defaultValueRef = useRef<T>(defaultValue);

  const history = useHistory();

  // This ensures that when the user navigates to another page, we do not set the state to the state of the new page,
  // the reason for this is because of the transition duration during animations
  const locationKeyRef = useRef<string | null>(history?.location.key ?? null);

  const [value, setValue] = useState<T>(history?.getCurrentState()[topic] ?? defaultValueRef.current);

  useEffect(() => {
    if (history) {
      locationKeyRef.current = history.location.key;

      setValue(history.getCurrentState()[topic] ?? defaultValueRef.current);
    }
  }, [topic, history]);

  useEffect(() => {
    if (!history) {
      return;
    }

    return history.listen(update => {
      if (update.location.key === locationKeyRef.current) {
        setValue(history.getCurrentState()[topic] ?? defaultValueRef.current);
      }
    });
  }, [history, topic]);

  const updateAndSetValue = useCallback(
    (value: T | ((old: T) => T)) => {
      if (!history) {
        setValue(value);

        return;
      }

      if (typeof value !== "function") {
        history.updateCurrentState(draft => {
          draft[topic] = value;
        });

        setValue(value);

        return;
      }

      const setter = value as (old: T) => T;

      setValue(old => {
        const newValue = setter(old);

        history.updateCurrentState(draft => {
          draft[topic] = newValue;
        });

        return newValue;
      });
    },
    [history, topic],
  );

  return [value, updateAndSetValue];
}

export function useHistoryLocationGetter() {
  const history = useHistory();

  return useCallback(() => {
    if (history) {
      return history.location;
    }

    return null;
  }, [history]);
}

export function useHistoryStateStasher() {
  const history = useHistory();

  return useMemo(() => {
    if (history) {
      return createHistoryStateStasher(history);
    }

    return () => null;
  }, [history]);
}

export function useHistoryStateStashPopper() {
  const history = useHistory();

  return useMemo(() => {
    if (history) {
      return createHistoryStateStashPopper(history);
    }

    return () => null;
  }, [history]);
}

function dispatchNavigationInterceptorEvent(
  history: PersistentHistory,
  interceptor: HistoryNavigationInterceptor,
  action: HistoryNavigationInterceptorEventAction,
) {
  let defaultPrevented = false;

  const event: HistoryNavigationInterceptorEvent = {
    history,
    action,
    updateCurrentState: createHistoryStateUpdater(history),
    stashState: createHistoryStateStasher(history),
    preventDefault: () => {
      defaultPrevented = true;
    },
    get defaultPrevented() {
      return defaultPrevented;
    },
  };

  interceptor(event);

  return { defaultPrevented };
}
