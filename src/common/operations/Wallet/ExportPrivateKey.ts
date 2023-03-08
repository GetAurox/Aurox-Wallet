import { registerQueryResponder, sendQuery } from "common/messaging";
import { ChainType } from "common/types";

const topic = "wallet/export-private-key";

export interface Data {
  uuid: string;
  chainType: ChainType;
  password: string;
}

export interface Result {
  privateKey: string;
}

export function registerResponder(handler: (data: Data) => Promise<Result>) {
  return registerQueryResponder<Data, Result>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(data: Data) {
  return sendQuery<Data, Result>(topic, "internal", data);
}
