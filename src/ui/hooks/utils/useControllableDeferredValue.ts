import { useState, useRef, useCallback } from "react";

/**
 * This hook provides previous value (defers update of it) until async loading of something is fully completed.
 * The exact moment from which deferred value starts returning is controlled by `startDeferring` function and stops returning by `stopDeferring`
 *
 * @param originalValue - The initial value
 *
 * @returns Normalized value and start/stop returning deferring value functions
 */
export function useControllableDeferredValue<T>(originalValue: T) {
  const [defer, setDefer] = useState(false);

  const ref = useRef(originalValue);

  const startDeferring = useCallback(() => {
    ref.current = originalValue;

    setDefer(true);
  }, [originalValue]);

  const stopDeferring = useCallback(() => setDefer(false), []);

  const deferredValue = defer ? ref.current : originalValue;

  return { deferredValue, startDeferring, stopDeferring };
}
