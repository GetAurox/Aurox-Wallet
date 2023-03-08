export interface DOMBroadcastPayload<T> {
  type: "broadcast";
  sender: "content-script" | "inject-script";
  id: string;
  topic: string;
  data: T;
}

export interface DOMQueryPayload<T> {
  type: "query";
  sender: "content-script" | "inject-script";
  id: string;
  uuid: string;
  topic: string;
  data: T;
}

export type DOMQueryResponsePayload<T> =
  | { type: "query-response"; sender: "content-script" | "inject-script"; id: string; uuid: string; failed: false; data: T }
  | { type: "query-response"; sender: "content-script" | "inject-script"; id: string; uuid: string; failed: true; error?: string };
