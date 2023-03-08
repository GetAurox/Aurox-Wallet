import { TypedEmitter } from "tiny-typed-emitter";
import { useEffect, useRef } from "react";
import throttle from "lodash/throttle";
import eq from "lodash/eq";

import { AddStorageChangeListener } from "common/storage";

import { useForceUpdater } from "../utils";

export function makeStorageHook<T extends NonNullable<object>>(
  load: () => Promise<T | null>,
  save: (value: T) => Promise<void>,
  defaultValue: T,
  options?: {
    /**
     * Throttling is needed to workaround chrome sync storage limitations.
     * https://developer.chrome.com/docs/extensions/reference/storage/#property-sync
     */
    throttleSave?: boolean;
    /**
     * A method used for listening on changes to the storage area that might come from a different entity or a different browser instance
     * specifically for sync storage.
     */
    addChangeListener?: AddStorageChangeListener<T>;
    /**
     * Used for equality checking, specifically useful for ignoring storage changes when state is already in sync
     */
    areEqual?: (a: T, b: T) => boolean;
  },
) {
  const throttleSave = options?.throttleSave ?? false;
  const addChangeListener = options?.addChangeListener ?? null;
  const areEqual = options?.areEqual ?? eq;

  const emitter = new TypedEmitter<{ set: (value: T) => void }>();

  emitter.setMaxListeners(Infinity);

  const normalizedSave = throttleSave ? throttle(save, 2000) : save;

  let currentValue: T = defaultValue;

  let initialLoadPromise: Promise<T | null> | null = load().then(value => {
    currentValue = value ?? defaultValue;

    initialLoadPromise = null;

    return currentValue;
  });

  const setter = (value: T | ((previous: T) => T)) => {
    currentValue = typeof value === "function" ? (value as (previous: T) => T)(currentValue) : value;

    emitter.emit("set", currentValue);

    normalizedSave(currentValue);
  };

  return function useStorage(): [T, typeof setter] {
    const valueRef = useRef<T>(currentValue);

    const forceUpdate = useForceUpdater();

    useEffect(() => {
      let tornDown = false;

      if (initialLoadPromise) {
        initialLoadPromise.then(value => {
          if (valueRef.current !== value) {
            valueRef.current = value ?? defaultValue;

            if (!tornDown) {
              forceUpdate();
            }
          }
        });
      }

      return () => {
        tornDown = true;
      };
    }, [forceUpdate]);

    useEffect(() => {
      const setHandler = (value: T) => {
        if (!areEqual(valueRef.current, value)) {
          valueRef.current = value;

          forceUpdate();
        }
      };

      emitter.addListener("set", setHandler);

      return () => {
        emitter.removeListener("set", setHandler);
      };
    }, [forceUpdate]);

    useEffect(() => {
      if (!addChangeListener) {
        return;
      }

      return addChangeListener(event => {
        const value = event.newValue ?? defaultValue;

        if (!areEqual(valueRef.current, value)) {
          valueRef.current = value;

          forceUpdate();
        }
      });
    }, [forceUpdate]);

    return [valueRef.current, setter];
  };
}
