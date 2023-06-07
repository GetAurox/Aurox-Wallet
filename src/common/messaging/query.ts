import { v4 as uuidV4 } from "uuid";

import { messageIsQueryResponse, messageIsQuery, getSenderAccessInfo, senderIsInternalExtensionFrame } from "./utils";
import { QueryEvent, QueryMessagePayload, QueryResponseMessagePayload, QueryTarget, SenderACL } from "./types";
import { QueryTimeoutError } from "./errors";

export interface SendQueryOptions {
  timeout?: number | null;
}

export async function sendQuery<T, S>(topic: string, target: QueryTarget, data: T, options?: SendQueryOptions): Promise<S> {
  let timeout: number | null = options?.timeout ?? 10 * 1000;

  if (options && options.timeout === null) {
    timeout = null;
  }

  return new Promise((resolve, reject) => {
    const requestUUID = uuidV4();

    let settled = false;

    let timer: any;

    const handler = (message: unknown, sender: chrome.runtime.MessageSender, sendResponse: () => void) => {
      if (!messageIsQueryResponse<S>(message, requestUUID)) return;

      sendResponse();

      clearTimeout(timer);

      if (!settled) {
        settled = true;

        chrome.runtime.onMessage.removeListener(handler);

        if (message.failed) {
          reject(new Error(message.error || "Unknown Error"));
        } else {
          resolve(message.data);
        }
      }
    };

    if (typeof timeout === "number") {
      timer = setTimeout(() => {
        chrome.runtime.onMessage.removeListener(handler);

        if (!settled) {
          settled = true;

          reject(new QueryTimeoutError(`Query timed out for "${topic}"`));
        }
      }, timeout);
    }

    chrome.runtime.onMessage.addListener(handler);

    if (target === "internal") {
      chrome.runtime.sendMessage<QueryMessagePayload<T>>({ type: "query", data, topic, uuid: requestUUID });
    } else if (Array.isArray(target) && target[0] === "tab") {
      chrome.tabs.sendMessage<QueryMessagePayload<T>>(target[1], { type: "query", data, topic, uuid: requestUUID });
    }
  });
}

export function registerQueryResponder<T, S>(topic: string, acl: SenderACL, responder: (event: QueryEvent<T>) => Promise<S>): () => void {
  const handler = async (message: unknown, sender: chrome.runtime.MessageSender, sendResponse: () => void) => {
    if (!messageIsQuery<T>(message, topic)) return;

    sendResponse();

    const access = getSenderAccessInfo(sender, acl);

    if (!access.allowed) return;

    let response: QueryResponseMessagePayload<S>;

    try {
      const data = await responder({ data: message.data, uuid: message.uuid, match: access.match, sender });

      response = { type: "query-response", uuid: message.uuid, data, failed: false };
    } catch (error) {
      response = { type: "query-response", uuid: message.uuid, failed: true, error: error?.message ?? undefined };
    }

    if (senderIsInternalExtensionFrame(access.match)) {
      chrome.runtime.sendMessage(response);
    } else {
      chrome.tabs.sendMessage(access.match.tabId, response);
    }
  };

  chrome.runtime.onMessage.addListener(handler);

  return () => {
    chrome.runtime.onMessage.removeListener(handler);
  };
}
