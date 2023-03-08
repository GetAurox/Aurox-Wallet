import { ReactElement, useCallback, useMemo } from "react";

import { HistoryNavigationInterceptor, HistoryNavigationInterceptorEvent } from "./types";
import { HistoryNavigationInterceptionContext } from "./context";
import { useHistoryNavigationInterceptor } from "./hooks";

export interface InterceptSubtreeHistoryNavigationProps {
  interceptor: HistoryNavigationInterceptor;
  children: ReactElement;
}

export function InterceptSubtreeHistoryNavigation(props: InterceptSubtreeHistoryNavigationProps) {
  const { interceptor: ownInterceptor, children } = props;

  const parentInterceptor = useHistoryNavigationInterceptor();

  const interceptor = useCallback(
    (event: HistoryNavigationInterceptorEvent) => {
      parentInterceptor(event);

      if (!event.defaultPrevented) {
        ownInterceptor(event);
      }
    },
    [ownInterceptor, parentInterceptor],
  );

  const value = useMemo(() => ({ interceptor }), [interceptor]);

  return <HistoryNavigationInterceptionContext.Provider value={value}>{children}</HistoryNavigationInterceptionContext.Provider>;
}
