import { useEffect, useState, useRef } from "react";
import { TypedEmitter } from "tiny-typed-emitter";
import throttle from "lodash/throttle";
import isEqual from "lodash/isEqual";

import { TickerSubscriber, subscribeToTickers } from "./subscriptions";
import { ImperativeTicker, TickerData, Tickers } from "./types";

function buildTickerStream(
  pairIds: readonly number[],
  throttleMaxWait: number | undefined,
  skipThrottleOnMultipleUpdates: boolean | undefined,
  callback: TickerSubscriber,
) {
  if (typeof throttleMaxWait === "number" && throttleMaxWait > 0) {
    let summary: Tickers = {};

    const drainSummary = () => {
      const result = summary;

      summary = {};

      callback(result);
    };

    const throttledDrainSummary = throttle(drainSummary, throttleMaxWait);

    const unsubscribe = subscribeToTickers(pairIds, patch => {
      summary = Object.assign(summary, patch);

      if (skipThrottleOnMultipleUpdates && Object.keys(patch).length > 1) {
        throttledDrainSummary.cancel();
        drainSummary();
      } else {
        throttledDrainSummary();
      }
    });

    return () => {
      throttledDrainSummary.cancel();

      unsubscribe();
    };
  }

  return subscribeToTickers(pairIds, callback);
}

export interface UseTickersOptions {
  /**
   * Useful for reducing updates
   */
  throttleMaxWait?: number;

  /**
   * Useful for when throttling multiple updates can make big UX impact
   */
  skipThrottleOnMultipleUpdates?: boolean;
}

export function useTickers(pairIds: readonly number[], { throttleMaxWait, skipThrottleOnMultipleUpdates }: UseTickersOptions = {}) {
  const [data, setData] = useState<Tickers>({});

  // We keep a reference here to make sure when the pairIds array changes reference it also changes content
  // otherwise we'll unsubscribe/resubscribe needlessly
  const pairIdsInEffectRef = useRef<readonly number[]>([]);

  if (pairIdsInEffectRef.current !== pairIds && !isEqual(pairIdsInEffectRef.current, pairIds)) {
    pairIdsInEffectRef.current = pairIds;
  }

  const effectivePairIds = pairIdsInEffectRef.current;

  useEffect(() => {
    if (!effectivePairIds || effectivePairIds.length === 0) {
      return;
    }

    const closeStream = buildTickerStream(effectivePairIds, throttleMaxWait, skipThrottleOnMultipleUpdates, patch => {
      setData(old => ({ ...old, ...patch }));
    });

    return () => {
      closeStream();

      setData({});
    };
  }, [effectivePairIds, throttleMaxWait, skipThrottleOnMultipleUpdates]);

  return data;
}

export function useTicker(pairId: number | null) {
  const [data, setData] = useState<TickerData | null>(null);

  useEffect(() => {
    if (pairId === null) {
      return;
    }

    const closeStream = buildTickerStream([pairId], undefined, false, patch => {
      if (patch[pairId]) {
        setData(patch[pairId]);
      }
    });

    return () => {
      closeStream();

      setData(null);
    };
  }, [pairId]);

  return data;
}

export function useTickerPrice(pairId: number | null) {
  const [data, setData] = useState<number | null>(null);

  useEffect(() => {
    if (pairId === null) {
      return;
    }

    const closeStream = buildTickerStream([pairId], undefined, false, patch => {
      if (patch[pairId] && typeof patch[pairId].price === "number") {
        setData(patch[pairId].price);
      }
    });

    return () => {
      closeStream();

      setData(null);
    };
  }, [pairId]);

  return data;
}

// ImperativeTickers are used to completely skip react renders for performance reasons
export function useImperativeTicker(pairIdOrParent: number | ImperativeTicker | null): ImperativeTicker | null {
  const [imperativeTicker, setImperativeTicker] = useState<ImperativeTicker | null>(null);

  useEffect(() => {
    if (typeof pairIdOrParent !== "number") {
      return;
    }

    const pairId = pairIdOrParent;

    const closeStream = buildTickerStream([pairId], undefined, false, patch => {
      if (patch[pairId]) {
        setImperativeTicker(imperative => {
          if (!imperative) {
            const events = new TypedEmitter();

            events.setMaxListeners(Infinity);

            return { pairId, current: { ...patch[pairId] }, events };
          }

          if (imperative.current.price !== patch[pairId].price) {
            imperative.current.price = patch[pairId].price;
            imperative.events.emit("change-price");
          }

          if (imperative.current.low24H !== patch[pairId].low24H) {
            imperative.current.low24H = patch[pairId].low24H;
            imperative.events.emit("change-low24H");
          }

          if (imperative.current.high24H !== patch[pairId].high24H) {
            imperative.current.high24H = patch[pairId].high24H;
            imperative.events.emit("change-high24H");
          }

          if (imperative.current.volume24H !== patch[pairId].volume24H) {
            imperative.current.volume24H = patch[pairId].volume24H;
            imperative.events.emit("change-volume24H");
          }

          if (imperative.current.change24H !== patch[pairId].change24H) {
            imperative.current.change24H = patch[pairId].change24H;
            imperative.events.emit("change-change24H");
          }

          if (imperative.current.change24HPercent !== patch[pairId].change24HPercent) {
            imperative.current.change24HPercent = patch[pairId].change24HPercent;
            imperative.events.emit("change-change24HPercent");
          }

          imperative.events.emit("change");

          return imperative;
        });
      }
    });

    return () => {
      closeStream();

      setImperativeTicker(null);
    };
  }, [pairIdOrParent]);

  if (pairIdOrParent && typeof pairIdOrParent !== "number") {
    return pairIdOrParent;
  }

  return imperativeTicker;
}
