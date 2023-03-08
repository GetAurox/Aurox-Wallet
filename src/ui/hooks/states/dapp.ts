import { useCallback } from "react";

import { SecureDAppState } from "common/states";

import { DAppTabConnection } from "common/types";

import { useCurrentTabId } from "ui/hooks/misc/useCurrentTabId";

import { useCurrentTabDomain } from "ui/hooks/misc/useCurrentTabDomain";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

export const useDappState = makeStateConsumerHook(SecureDAppState.buildConsumer());

export const useDappStateAssertReady = makeConsumerReadyAsserterHook(useDappState);

/** Uses connection information about the connected dApp */
export function useDAppConnection(domain: string | null, tabId: number | null) {
  const selector = useCallback(
    (connections: DAppTabConnection[]) => {
      if (domain && tabId) {
        return connections.find(connection => connection.domain === domain && connection.tabId === tabId);
      }
    },
    [domain, tabId],
  );

  return useDappState(selector);
}

export function useCurrentTabDappConnectionInfo() {
  const domain = useCurrentTabDomain();
  const tabId = useCurrentTabId();
  const connection = useDAppConnection(domain, tabId);
  const isDAppConnected = !!connection;

  return { isDAppConnected, connection, tabId, domain };
}
