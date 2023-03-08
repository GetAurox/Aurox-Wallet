import { registerQueryResponder, sendQuery } from "common/messaging";
import { ChainType } from "common/types";

const topic = "wallet/import-private-key-account";

export interface Data {
  chainType: ChainType;
  uuid: string;
  alias: string;
  privateKey: string;
}

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(data: Data) {
  return await sendQuery<Data, void>(topic, "internal", data);
}
