import { registerQueryResponder, sendQuery } from "common/messaging";
import { ChainType } from "common/types";

const topic = "wallet/get-derived-addresses";

export interface Data {
  chainType: ChainType;
  accountNumbers: number[];
}

export function registerResponder(handler: (data: Data) => Promise<string[]>) {
  return registerQueryResponder<Data, string[]>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(chainType: ChainType, accountNumbers: number[]) {
  return await sendQuery<Data, string[]>(topic, "internal", { chainType, accountNumbers });
}
