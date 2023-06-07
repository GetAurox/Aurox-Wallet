import { SyncQueryEvent, SyncQueryMessagePayload, SyncQueryResponseMessagePayload, QueryTarget, SenderACL } from "./types";
import { messageIsSyncQuery, getSenderAccessInfo } from "./utils";

/**
 * These queries do not run synchronously, they only use synchronous responders.
 *
 * Useful for fast data acquisitions
 */
export function sendSyncResponderQuery<T, S>(topic: string, target: QueryTarget, data: T): Promise<S> {
  return new Promise((resolve, reject) => {
    const handler = (response: SyncQueryResponseMessagePayload<S>) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message ?? "Unknown Error occurred while probing service worker"));

        return;
      }

      if (response.failed) {
        reject(new Error(response.error || "Unknown Error"));
      } else {
        resolve(response.data);
      }
    };

    if (target === "internal") {
      chrome.runtime.sendMessage<SyncQueryMessagePayload<T>>({ type: "sync-query", data, topic }, handler);
    } else if (Array.isArray(target) && target[0] === "tab") {
      chrome.tabs.sendMessage<SyncQueryMessagePayload<T>>(target[1], { type: "sync-query", data, topic }, handler);
    }
  });
}

export function registerSyncQueryResponder<T, S>(topic: string, acl: SenderACL, responder: (event: SyncQueryEvent<T>) => S): () => void {
  const handler = (
    message: unknown,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: SyncQueryResponseMessagePayload<S>) => void,
  ) => {
    if (!messageIsSyncQuery<T>(message, topic)) return;

    const access = getSenderAccessInfo(sender, acl);

    if (!access.allowed) return;

    try {
      const data = responder({ data: message.data, match: access.match, sender });

      sendResponse({ type: "sync-query-response", data, failed: false });
    } catch (error) {
      sendResponse({ type: "sync-query-response", failed: true, error: error?.message ?? undefined });
    }
  };

  chrome.runtime.onMessage.addListener(handler);

  return () => {
    chrome.runtime.onMessage.removeListener(handler);
  };
}
