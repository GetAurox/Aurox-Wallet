import { SecurePasswordState } from "common/states";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

export const usePasswordState = makeStateConsumerHook(SecurePasswordState.buildConsumer());

export const usePasswordStateAssertReady = makeConsumerReadyAsserterHook(usePasswordState);

export function useHasPassword() {
  return usePasswordState(hasPasswordSelector);
}

export function useIsPasswordVerified() {
  return usePasswordState(isPasswordVerifiedSelector);
}

const hasPasswordSelector = (data: SecurePasswordState.Data) => data?.hasPassword ?? null;
const isPasswordVerifiedSelector = (data: SecurePasswordState.Data) => data?.isPasswordVerified ?? null;
