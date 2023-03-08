import { useEffect, useRef } from "react";
import identity from "lodash/identity";
import eq from "lodash/eq";

import { CommonStateConsumer } from "common/states";

import { useForceUpdater } from "./useForceUpdater";

export function makeStateConsumerHook<Topic extends string, Data extends NonNullable<object>>(consumer: CommonStateConsumer<Topic, Data>) {
  return function useStateConsumer<T = Data>(
    selector: (data: Data) => T | null = identity,
    areEqual: (a: T | null, b: T | null) => boolean = eq,
  ): NonNullable<T> | null {
    const initiallyInitialized = useRef(consumer.initialized);

    const initialRef = useRef(true);
    const dataRef = useRef<Data | null>(null);
    const resultRef = useRef<NonNullable<T> | null>(null);
    const selectorRef = useRef(selector);

    const forceUpdate = useForceUpdater();

    // if the selector is changed then we must run again on the latest state
    if (selectorRef.current !== selector) {
      resultRef.current = dataRef.current ? selector(dataRef.current) ?? null : null;
    }

    selectorRef.current = selector;

    if (initialRef.current) {
      initialRef.current = false;

      if (initiallyInitialized.current) {
        dataRef.current = consumer.getCurrent();
      }

      resultRef.current = dataRef.current ? selectorRef.current(dataRef.current) ?? null : null;
    }

    useEffect(() => {
      let tornDown = false;

      if (!initiallyInitialized.current) {
        consumer.ready.then(() => {
          dataRef.current = consumer.getCurrent();

          resultRef.current = dataRef.current ? selectorRef.current(dataRef.current) ?? null : null;

          if (!tornDown) {
            forceUpdate();
          }
        });

        consumer.initialize();
      }

      return () => {
        tornDown = true;
      };
    }, [forceUpdate]);

    useEffect(() => {
      let tornDown = false;

      const changeHandler = (data: Data) => {
        dataRef.current = data;

        const newResult = data ? selectorRef.current(data) ?? null : null;

        // if the result is changed after we receive an update we should forceUpdate the component
        if (!areEqual(newResult, resultRef.current)) {
          resultRef.current = newResult ?? null;

          if (!tornDown) {
            forceUpdate();
          }
        }
      };

      consumer.addListener("changed", changeHandler);

      return () => {
        tornDown = true;

        consumer.removeListener("changed", changeHandler);
      };
    }, [areEqual, forceUpdate]);

    return resultRef.current;
  };
}

function readyAsserterSelector(data: any) {
  return data !== null;
}

export function makeConsumerReadyAsserterHook<Data extends NonNullable<object>>(
  useConsumerHook: <T = Data>(selector: (data: Data) => T | null) => NonNullable<T> | null,
) {
  return function useAssertConsumerReady() {
    return useConsumerHook(readyAsserterSelector) ?? false;
  };
}
