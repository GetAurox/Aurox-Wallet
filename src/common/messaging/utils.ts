import { SERVICE_WORKER_URL, POPUP_URL, EXPANDED_URL, HARDWARE_URL, CONNECT_URL, ONBOARDING_URL } from "common/entities";

import {
  BroadcastMessagePayload,
  QueryMessagePayload,
  QueryResponseMessagePayload,
  SenderAccessInfo,
  SenderACL,
  SenderSourceMatch,
  SenderSourceMatchInternal,
  SyncQueryMessagePayload,
} from "./types";

export function messageIsBroadcast<T>(message: unknown, topic: string): message is BroadcastMessagePayload<T> {
  if (!message) {
    return false;
  }

  return (message as BroadcastMessagePayload<T>).type === "broadcast" && (message as BroadcastMessagePayload<T>).topic === topic;
}

export function messageIsQuery<T>(message: unknown, topic: string): message is QueryMessagePayload<T> {
  if (!message) {
    return false;
  }

  return (message as QueryMessagePayload<T>).type === "query" && (message as QueryMessagePayload<T>).topic === topic;
}

export function messageIsQueryResponse<T>(message: unknown, uuid: string): message is QueryResponseMessagePayload<T> {
  if (!message) {
    return false;
  }

  return (message as QueryResponseMessagePayload<T>).type === "query-response" && (message as QueryResponseMessagePayload<T>).uuid === uuid;
}

export function messageIsSyncQuery<T>(message: unknown, topic: string): message is SyncQueryMessagePayload<T> {
  if (!message) {
    return false;
  }

  return (message as SyncQueryMessagePayload<T>).type === "sync-query" && (message as QueryMessagePayload<T>).topic === topic;
}

export function getSenderSourceMatch(sender: chrome.runtime.MessageSender): SenderSourceMatch | null {
  if (!sender) {
    return null;
  }

  // Make sure under no circumstances requests from other extensions are accepted
  if (sender.id !== chrome.runtime.id) {
    return null;
  }

  if (sender.origin === "null") {
    // when we cannot infer the origin it means we are in content-script and the origin is the extension, but the exact source is unknowable
    return { source: "redacted" };
  }

  if (!sender.url) {
    return null;
  }

  if (!sender.origin) {
    // Service worker is not a renderer process, so it does not have an origin
    if (sender.url.startsWith(SERVICE_WORKER_URL)) {
      return { source: "service-worker" };
    }

    return null;
  }

  if (sender.url.startsWith(CONNECT_URL)) {
    return { source: "window", frame: "connect", tabId: sender.tab?.id, windowId: sender.tab?.windowId };
  }

  if (sender.tab) {
    if (typeof sender.tab.id !== "number") {
      return null;
    }

    if (sender.url.startsWith(EXPANDED_URL)) {
      return { source: "web-view", frame: "expanded", tabId: sender.tab.id, windowId: sender.tab.windowId };
    }

    if (sender.url.startsWith(ONBOARDING_URL)) {
      return { source: "web-view", frame: "onboarding", tabId: sender.tab.id, windowId: sender.tab.windowId };
    }

    if (sender.url.startsWith(HARDWARE_URL)) {
      return { source: "web-view", frame: "hardware", tabId: sender.tab.id, windowId: sender.tab.windowId };
    }

    return { source: "content-script", tabId: sender.tab.id, windowId: sender.tab.windowId };
  }

  if (sender.url.startsWith(POPUP_URL)) {
    return { source: "popup" };
  }

  return null;
}

export function senderIsInternalExtensionFrame(match: SenderSourceMatch): match is SenderSourceMatchInternal {
  // Redacted is only possible when we are in content-script and the source is any of the internal frames extension
  return match.source === "service-worker" || match.source === "popup" || match.source === "window" || match.source === "redacted";
}

export function getSenderAccessInfo(sender: chrome.runtime.MessageSender, acl: SenderACL): SenderAccessInfo {
  // When mocking, we cannot differentiate between entities as everything is run in the same context
  if (process.env.MOCK_EXTENSION_API === "true") {
    return { allowed: true, match: { source: "redacted" } };
  }

  const match = getSenderSourceMatch(sender);

  if (!match) {
    return { allowed: false };
  }

  let access = false;

  switch (match.source) {
    case "service-worker":
      access = acl.some(([source]) => source === "service-worker");
      break;
    case "popup":
      access = acl.some(([source]) => source === "popup");
      break;
    case "window":
      access = acl.some(([source, frame]) => source === "window" && frame && frame.includes(match.frame));
      break;
    case "web-view":
      access = acl.some(
        ([source, frame, tabIds]) =>
          source === "web-view" && frame && frame.includes(match.frame) && tabIds && (tabIds === "all" || tabIds.includes(match.tabId)),
      );
      break;
    case "content-script":
      access = acl.some(([source, tabIds]) => source === "content-script" && tabIds && (tabIds === "all" || tabIds.includes(match.tabId)));
      break;
    case "redacted":
      access = acl.some(([source]) => source === "redacted");
      break;
  }

  if (!access) {
    return { allowed: false };
  }

  return { allowed: true, match };
}
