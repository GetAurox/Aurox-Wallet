import { unstable_batchedUpdates } from "react-dom";

import throttle from "lodash/throttle";
import intersection from "lodash/intersection";

import { TickerServiceConnection } from "./TickerServiceConnection";
import { TickerData, Tickers } from "./types";

const CLEAN_UP_THROTTLE_WAIT = 2 * 1000;

export type TickerSubscriber = (patch: Tickers) => void;

let connection: TickerServiceConnection | undefined;

// Used to track which pairs each subscriber cares for
const subscriberToPairIdsMap = new Map<TickerSubscriber, readonly number[]>();

// In case there is a single pair update it makes sense to avoid iterating through all subscribers to find matches
// so this is a small optimization as well as a simplification method for gathering pairs to unsubscribe, tested against activePairIds
const pairIdToSubscribersMap = new Map<number, Set<TickerSubscriber>>();

// We keep a redundant set of active pairIds to know which pairs the backend is sending data for
// this is because we don't immediately send unsubscribe when a subscriber is removed
const activePairIdsSet = new Set<number>();

// A local cache to send instant snapshot for the pairs we already know about
const localCache = new Map<number, TickerData>();

const updatingPairIdsSet = new Set<number>();

const sendUpdates = () => {
  const updatingPairIds = [...updatingPairIdsSet];
  updatingPairIdsSet.clear();

  const patch: Tickers = {};

  for (const pairId of updatingPairIds) {
    const ticker = localCache.get(pairId);

    if (ticker) {
      patch[pairId] = ticker;
    }
  }

  unstable_batchedUpdates(() => {
    // Tiny optimization, since most updates are singular
    // It makes sense to avoid iterating through all subscribers
    if (updatingPairIds.length === 1) {
      const targetSubscribers = pairIdToSubscribersMap.get(updatingPairIds[0]);

      if (targetSubscribers) {
        for (const targetSubscriber of targetSubscribers.values()) {
          targetSubscriber(patch);
        }
      }
    } else if (updatingPairIds.length > 1) {
      for (const [subscriber, pairIds] of subscriberToPairIdsMap) {
        const toSend = intersection(pairIds, updatingPairIds);

        const prunedUpdate: Tickers = {};

        for (const toSendPairId of toSend) {
          if (patch[toSendPairId]) {
            prunedUpdate[toSendPairId] = patch[toSendPairId];
          }
        }

        if (toSend.length > 0) {
          subscriber(prunedUpdate);
        }
      }
    }
  });
};

const throttledSendUpdates = throttle(sendUpdates, 200);

const cleanup = () => {
  const inactivePairIds: number[] = [];

  for (const activePairId of activePairIdsSet) {
    if (!pairIdToSubscribersMap.has(activePairId)) {
      inactivePairIds.push(activePairId);
    }
  }

  if (inactivePairIds.length > 0) {
    for (const inactivePairId of inactivePairIds) {
      activePairIdsSet.delete(inactivePairId);
      localCache.delete(inactivePairId);
    }

    connection?.applyAction("unsubscribe", inactivePairIds);
  }
};

// We throttle the cleanup logic to make sure we don't unsubscribe/resubscribe too many times
const throttledCleanup = throttle(cleanup, CLEAN_UP_THROTTLE_WAIT, { leading: false, trailing: true });

export function subscribeToTickers(pairIds: readonly number[], subscriber: TickerSubscriber) {
  subscriberToPairIdsMap.set(subscriber, pairIds);

  const inactivePairIds: number[] = [];

  for (const pairId of pairIds) {
    if (!activePairIdsSet.has(pairId)) {
      inactivePairIds.push(pairId);
      activePairIdsSet.add(pairId);
    }

    if (pairIdToSubscribersMap.has(pairId)) {
      pairIdToSubscribersMap.get(pairId)?.add(subscriber);
    } else {
      pairIdToSubscribersMap.set(pairId, new Set([subscriber]));
    }
  }

  const snapshot: Tickers = {};
  let hasData = false;

  for (const pairId of pairIds) {
    const cached = localCache.get(pairId);

    if (cached) {
      snapshot[pairId] = cached;
      hasData = true;
    }
  }

  if (hasData) {
    setTimeout(() => subscriber(snapshot));
  }

  if (inactivePairIds.length > 0) {
    connection?.applyAction("subscribe", inactivePairIds);
  }

  return () => {
    const pairIds = subscriberToPairIdsMap.get(subscriber) ?? [];

    subscriberToPairIdsMap.delete(subscriber);

    for (const pairId of pairIds) {
      const subscribersSet = pairIdToSubscribersMap.get(pairId);

      if (subscribersSet) {
        subscribersSet.delete(subscriber);

        if (subscribersSet.size === 0) {
          pairIdToSubscribersMap.delete(pairId);
        }
      }
    }

    throttledCleanup();
  };
}

export function setupTickers() {
  const handlePatch = (patch: Tickers) => {
    const receivedPairIds = Object.keys(patch).map(Number);

    for (const pairId of receivedPairIds) {
      updatingPairIdsSet.add(pairId);

      if (activePairIdsSet.has(pairId)) {
        // We check for the pair to be active before setting it on the cache.
        // This is to avoid memory leak when we unsubscribe but still get
        // data simply because the unsubscription has not been put into effect
        localCache.set(pairId, patch[pairId]);
      }
    }

    throttledSendUpdates();
  };

  connection = new TickerServiceConnection({
    getCurrentPairIds: () => [...activePairIdsSet.keys()],
    onPatch: handlePatch,
  });

  return () => {
    connection?.stop();
  };
}
