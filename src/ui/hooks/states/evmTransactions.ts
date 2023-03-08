import { useCallback } from "react";
import pickBy from "lodash/pickBy";
import { Dictionary } from "lodash";

import { SecureEVMTransactionsState } from "common/states";

import { EVMTransactionEntry } from "common/types";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

export const useEVMTransactionsState = makeStateConsumerHook(SecureEVMTransactionsState.buildConsumer());

export const useEVMTransactionsStateAssertReady = makeConsumerReadyAsserterHook(useEVMTransactionsState);

export function useEVMTransactions(): SecureEVMTransactionsState.Data["evmTransactionsData"] | null {
  return useEVMTransactionsState(evmTransactionsSelector);
}

export function useEVMTransactionsOfAccount(accountUUID?: string | null): Dictionary<EVMTransactionEntry> | null {
  const selector = useCallback(
    (data: SecureEVMTransactionsState.Data) =>
      !accountUUID ? null : pickBy(data.evmTransactionsData, entry => entry.accountUUID === accountUUID),
    [accountUUID],
  );

  return useEVMTransactionsState(selector);
}

const evmTransactionsSelector = (data: SecureEVMTransactionsState.Data) => data.evmTransactionsData ?? null;
