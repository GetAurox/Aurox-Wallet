import { EIP1193Event, EIP1193EventFromType, EIP1193EventType } from "common/types";

import { domBroadcast, addDOMBroadcastListener } from "../messaging";

const topic = "provider-update";

export function addListener(handler: (event: EIP1193Event) => void) {
  return addDOMBroadcastListener<EIP1193Event>(topic, handler);
}

export function broadcast<T extends EIP1193EventType>(type: T, data?: EIP1193EventFromType<T>["data"]) {
  return domBroadcast(topic, { type, data } as EIP1193EventFromType<T>);
}
