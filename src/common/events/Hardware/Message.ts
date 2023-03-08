import { addBroadcastListener, broadcast as messagingBroadcast, SenderACL } from "common/messaging";

const topic = "hardware/message";

export interface Payload {
  success: boolean;
  result?: string;
  error?: any;
}

const acl: SenderACL = [["web-view", ["hardware"], "all"]];

export function addListener(handler: (data: Payload) => void) {
  return addBroadcastListener<Payload>(topic, acl, event => handler(event.data));
}

export function broadcast(response: Payload) {
  messagingBroadcast<Payload>(topic, { internals: "all" }, response);
}
