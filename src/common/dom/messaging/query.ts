import { v4 as uuidV4 } from "uuid";

import { DOMQueryPayload, DOMQueryResponsePayload } from "./types";
import { sender, id } from "./setup";
import { DOMQueryTimeoutError } from "./errors";

export interface SendDOMQueryOptions {
  timeout?: number | null;
}

export async function sendDOMQuery<T, S>(topic: string, data: T, options?: SendDOMQueryOptions): Promise<S> {
  if (!sender || !id) {
    throw new Error("Invalid State: sender is not preset");
  }

  let timeout: number | null = options?.timeout ?? 10 * 1000;

  if (options && options.timeout === null) {
    timeout = null;
  }

  return new Promise((resolve, reject) => {
    const requestUUID = uuidV4();

    let settled = false;

    let timer: any;

    const handler = (event: MessageEvent<DOMQueryResponsePayload<S>>) => {
      const payload = event.data;

      if (
        event.source !== window ||
        sender === payload.sender ||
        id !== payload.id ||
        requestUUID !== payload.uuid ||
        payload.type !== "query-response"
      ) {
        return;
      }

      clearTimeout(timer);

      if (!settled) {
        settled = true;

        window.removeEventListener("message", handler);

        if (payload.failed) {
          reject(new Error(payload.error || "Unknown Error"));
        } else {
          resolve(payload.data!);
        }
      }
    };

    if (typeof timeout === "number") {
      timer = setTimeout(() => {
        window.removeEventListener("message", handler);

        if (!settled) {
          settled = true;

          reject(new DOMQueryTimeoutError(`DOM Query timed out for "${topic}"`));
        }
      }, timeout);
    }

    window.addEventListener("message", handler);

    window.postMessage({ type: "query", sender, id, uuid: requestUUID, topic, data } as DOMQueryPayload<T>, "*");
  });
}

export function registerDOMQueryResponder<T, S>(topic: string, responder: (data: T) => Promise<S>): () => void {
  if (!sender || !id) {
    throw new Error("Invalid State: sender is not preset");
  }

  const handler = async (event: MessageEvent<DOMQueryPayload<T>>) => {
    const payload = event.data;

    if (event.source !== window || sender === payload.sender || id !== payload.id || topic !== payload.topic || payload.type !== "query") {
      return;
    }

    let response: DOMQueryResponsePayload<S>;

    try {
      const data = await responder(payload.data);

      response = { type: "query-response", sender: sender!, id, uuid: payload.uuid, data, failed: false };
    } catch (error) {
      response = { type: "query-response", sender: sender!, id, uuid: payload.uuid, failed: true, error: error?.message ?? undefined };
    }

    window.postMessage(response, "*");
  };

  window.addEventListener("message", handler);

  return () => {
    window.removeEventListener("message", handler);
  };
}
