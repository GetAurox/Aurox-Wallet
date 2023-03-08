import { registerQueryResponder, sendQuery } from "common/messaging";
import { HardwareSignerAccountInfo } from "common/types";

const topic = "wallet/import-hardware-signer";

export type Data = HardwareSignerAccountInfo;

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, [["web-view", ["hardware"], "all"]], event => handler(event.data));
}

export async function perform(data: Data) {
  await sendQuery<Data, void>(topic, "internal", data);
}
