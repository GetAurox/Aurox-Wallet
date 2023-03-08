import { SecureHardwareState } from "common/states";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

export const useHardwareState = makeStateConsumerHook(SecureHardwareState.buildConsumer());

export const useAssertHardwareStateReady = makeConsumerReadyAsserterHook(useHardwareState);
