import { EIP1193Request, EIP1193Response } from "common/types";

import { registerDOMQueryResponder, sendDOMQuery } from "../messaging";

const topic = "send-rpc-request";

export function registerResponder(handler: (request: EIP1193Request) => Promise<EIP1193Response>) {
  return registerDOMQueryResponder<EIP1193Request, EIP1193Response>(topic, async (request: EIP1193Request) => await handler(request));
}

export async function perform(request: EIP1193Request): Promise<EIP1193Response> {
  return await sendDOMQuery<EIP1193Request, EIP1193Response>(topic, request, { timeout: 5 * 60 * 1000 });
}
