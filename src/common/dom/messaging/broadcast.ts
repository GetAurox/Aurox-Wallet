import { DOMBroadcastPayload } from "./types";
import { sender, id } from "./setup";

export function domBroadcast<T>(topic: string, data: T) {
  if (!sender || !id) {
    throw new Error("Invalid State: sender is not preset");
  }

  window.postMessage({ type: "broadcast", sender, id, topic, data } as DOMBroadcastPayload<T>, "*");
}

export function addDOMBroadcastListener<T>(topic: string, listener: (data: T) => void): () => void {
  if (!sender || !id) {
    throw new Error("Invalid State: sender is not preset");
  }

  const handler = (event: MessageEvent<DOMBroadcastPayload<T>>) => {
    const payload = event.data;

    if (
      event.source === window &&
      sender !== payload.sender &&
      id === payload.id &&
      topic === payload.topic &&
      payload.type === "broadcast"
    ) {
      listener(payload.data);
    }
  };

  window.addEventListener("message", handler);

  return () => {
    window.removeEventListener("message", handler);
  };
}
