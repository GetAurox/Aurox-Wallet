import { useCallback } from "react";

import { PublicDAppOperationsState } from "common/states";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

const useDAppOperationsState = makeStateConsumerHook(PublicDAppOperationsState.buildConsumer());

export const useDAppOperationsStateAssertReady = makeConsumerReadyAsserterHook(useDAppOperationsState);

interface DappOperationsFilter {
  domain?: string | null;
  tabId?: number | null;
  operationType?: "connect" | "transact" | null;
  accountAddress?: string | null;
}

export function useDAppOperations(filter?: DappOperationsFilter) {
  const selector = useCallback(
    (data: PublicDAppOperationsState.Data) => {
      let operations = data.operations;

      // Apply filters if available
      operations = operations.filter(op => !filter?.domain || op.domain === filter.domain);
      operations = operations.filter(op => !filter?.tabId || op.tabId === filter.tabId);
      operations = operations.filter(op => !filter?.operationType || op.operationType === filter.operationType);
      operations = operations.filter(op => {
        if (op.operationType === "transact" && filter?.accountAddress) {
          const isAccountOperation = op.transactionPayload.from.toLowerCase() === filter.accountAddress.toLowerCase();

          return isAccountOperation;
        }

        return true;
      });

      return operations;
    },
    [filter],
  );

  return useDAppOperationsState(selector);
}
