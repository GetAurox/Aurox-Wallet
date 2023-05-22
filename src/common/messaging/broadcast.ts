import uniq from "lodash/uniq";

import { BroadcastEvent, BroadcastMessagePayload, SenderACL, BroadcastTarget } from "./types";
import { getSenderAccessInfo, messageIsBroadcast } from "./utils";

export async function broadcast<T>(topic: string, target: BroadcastTarget, data: T) {
  const tasks = [];

  if (target.internals === "all") {
    tasks.push(chrome.runtime.sendMessage<BroadcastMessagePayload<T>>({ type: "broadcast", topic, data }));
  }

  if (target.tabIds && target.tabIds.length > 0) {
    for (const tabId of uniq(target.tabIds)) {
      tasks.push(chrome.tabs.sendMessage<BroadcastMessagePayload<T>>(tabId, { type: "broadcast", topic, data }));
    }
  }

  await Promise.allSettled(tasks);
}

export function addBroadcastListener<T>(topic: string, acl: SenderACL, listener: (event: BroadcastEvent<T>) => void): () => void {
  const handler = (message: unknown, sender: chrome.runtime.MessageSender, sendResponse: () => void) => {
    if (!messageIsBroadcast<T>(message, topic)) return;

    sendResponse();

    const access = getSenderAccessInfo(sender, acl);

    if (!access.allowed) return;

    listener({ data: message.data, match: access.match, sender });
  };

  chrome.runtime.onMessage.addListener(handler);

  return () => {
    chrome.runtime.onMessage.removeListener(handler);
  };
}
