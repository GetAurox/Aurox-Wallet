export type WindowFrame = "connect";

export type WebViewFrame = "hardware" | "expanded" | "onboarding";

export type TabACL = "all" | number[];

export type SenderACLItem =
  | [source: "service-worker"]
  | [source: "popup"]
  | [source: "window", frames: WindowFrame[]]
  | [source: "web-view", frames: WebViewFrame[], tabIds: TabACL]
  | [source: "content-script", tabIds: TabACL]
  | [source: "redacted"];

export type SenderACL = SenderACLItem[];

export type SenderSourceMatchInternal =
  | { source: "service-worker" }
  | { source: "popup" }
  | { source: "window"; frame: WindowFrame; tabId?: number; windowId?: number }
  | { source: "redacted" };

export type SenderSourceMatchBrowserTab =
  | { source: "web-view"; frame: WebViewFrame; tabId: number; windowId: number }
  | { source: "content-script"; tabId: number; windowId: number };

export type SenderSourceMatch = SenderSourceMatchInternal | SenderSourceMatchBrowserTab;

export type SenderAccessInfo = { allowed: false } | { allowed: true; match: SenderSourceMatch };

export interface BroadcastTarget {
  internals?: "all" | "none";
  tabIds?: number[];
}

export interface BroadcastMessagePayload<T> {
  type: "broadcast";
  topic: string;
  data: T;
}

export interface BroadcastEvent<T> {
  data: T;
  match: SenderSourceMatch;
  sender: chrome.runtime.MessageSender;
}

export type QueryTarget = "internal" | ["tab", number];

export interface QueryMessagePayload<T> {
  type: "query";
  topic: string;
  uuid: string;
  data: T;
}

export type QueryResponseMessagePayload<T> =
  | { type: "query-response"; uuid: string; failed: false; data: T }
  | { type: "query-response"; uuid: string; failed: true; error?: string };

export interface QueryEvent<T> {
  data: T;
  uuid: string;
  match: SenderSourceMatch;
  sender: chrome.runtime.MessageSender;
}

export interface SyncQueryMessagePayload<T> {
  type: "sync-query";
  topic: string;
  data: T;
}

export type SyncQueryResponseMessagePayload<T> =
  | { type: "sync-query-response"; failed: false; data: T }
  | { type: "sync-query-response"; failed: true; error?: string };

export interface SyncQueryEvent<T> {
  data: T;
  match: SenderSourceMatch;
  sender: chrome.runtime.MessageSender;
}
