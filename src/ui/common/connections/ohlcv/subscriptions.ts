import { OHLCVDataItem } from "@aurox/ohlcv-helpers";

import { OHLCVServiceConnection } from "./OHLCVServiceConnection";

export type OHLCVSubscriber = (pairId: number, update: OHLCVDataItem) => void;

const subscriberToPairIdsMap = new Map<OHLCVSubscriber, readonly number[]>();
const pairIdToSubscribersMap = new Map<number, Set<OHLCVSubscriber>>();

let connection: OHLCVServiceConnection | undefined;

export function subscribeToOHLCV(pairIds: number[], subscriber: OHLCVSubscriber) {
  subscriberToPairIdsMap.set(subscriber, pairIds);

  const toSubscribePairIds: number[] = [];

  for (const pairId of pairIds) {
    if (pairIdToSubscribersMap.has(pairId)) {
      pairIdToSubscribersMap.get(pairId)?.add(subscriber);
    } else {
      pairIdToSubscribersMap.set(pairId, new Set([subscriber]));
      toSubscribePairIds.push(pairId);
    }
  }

  if (toSubscribePairIds.length > 0) {
    connection?.applyAction("subscribe", toSubscribePairIds);
  }

  return () => {
    const pairIds = subscriberToPairIdsMap.get(subscriber) ?? [];

    subscriberToPairIdsMap.delete(subscriber);

    const toUnsubscribePairIds: number[] = [];

    for (const pairId of pairIds) {
      const clientsSet = pairIdToSubscribersMap.get(pairId);

      if (clientsSet) {
        clientsSet.delete(subscriber);

        if (clientsSet.size === 0) {
          pairIdToSubscribersMap.delete(pairId);
          toUnsubscribePairIds.push(pairId);
        }
      }
    }

    if (toUnsubscribePairIds.length > 0) {
      connection?.applyAction("unsubscribe", toUnsubscribePairIds);
    }
  };
}

export function setupOHLCV() {
  const handleUpdate = (pairId: number, update: OHLCVDataItem) => {
    const targetSubscribers = pairIdToSubscribersMap.get(pairId);

    if (targetSubscribers) {
      for (const targetSubscriber of targetSubscribers.values()) {
        targetSubscriber(pairId, update);
      }
    }
  };

  connection = new OHLCVServiceConnection({
    getCurrentPairIds: () => [...pairIdToSubscribersMap.keys()],
    onUpdate: handleUpdate,
  });

  return () => {
    connection?.stop();
  };
}
