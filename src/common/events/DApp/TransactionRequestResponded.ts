import { addBroadcastListener, broadcast as messagingBroadcast, SenderACL } from "common/messaging";
import { OperationResponse } from "common/types";

const topic = "dapp/transaction-request-responded";

export interface Payload {
  operationId: string;
  result: OperationResponse;
  keepPopupAlive: boolean;
}

const acl: SenderACL = [["service-worker"], ["popup"], ["window", ["connect"]]];

export function addListener(handler: (data: Payload) => void) {
  return addBroadcastListener<Payload>(topic, acl, event => handler(event.data));
}

export function broadcast(operationId: string, result: OperationResponse, keepPopupAlive = false) {
  messagingBroadcast<Payload>(topic, { internals: "all" }, { operationId, keepPopupAlive, result: result });
}
