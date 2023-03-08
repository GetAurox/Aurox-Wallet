import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import { To } from "history";

import { buildBrowserHistoryForExtensionAPIMocking } from "ui/common/mock";

import { PersistentHistory } from "./PersistentHistory";
import { PersistentHistoryContext } from "./context";

export interface PersistentRouterProps {
  children: ReactElement;
}

export function PersistentRouter(props: PersistentRouterProps) {
  const { children } = props;

  const [history, setHistory] = useState<PersistentHistory | null>(null);

  useEffect(() => {
    let canceled = false;

    const setup = async () => {
      if (process.env.MOCK_EXTENSION_API === "true") {
        setHistory(buildBrowserHistoryForExtensionAPIMocking());

        return;
      }

      const history = await new PersistentHistory().initialize();

      if (canceled) {
        return;
      }

      setHistory(history);
    };

    setup();

    return () => {
      canceled = true;
    };
  }, []);

  const reset = useCallback(
    (to: To, state?: any) => {
      if (history) {
        history.reset(to, state);
      }
    },
    [history],
  );

  const value = useMemo(() => ({ history, reset }), [history, reset]);

  return (
    <PersistentHistoryContext.Provider value={value}>
      {history && <HistoryRouter history={history}>{children}</HistoryRouter>}
    </PersistentHistoryContext.Provider>
  );
}
