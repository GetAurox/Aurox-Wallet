import { SecureGaslessTransactionState } from "common/states";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

export const useGaslessTransactionInformationState = makeStateConsumerHook(SecureGaslessTransactionState.buildConsumer());

export const useGaslessTransactionInformationStateAssertReady = makeConsumerReadyAsserterHook(useGaslessTransactionInformationState);

export function useGaslessTransactionInformation(): SecureGaslessTransactionState.Data | null {
  return useGaslessTransactionInformationState(gaslessTransactionSelector);
}

const gaslessTransactionSelector = (data: SecureGaslessTransactionState.Data) => data ?? null;
