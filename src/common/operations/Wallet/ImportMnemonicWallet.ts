import { registerQueryResponder, sendQuery } from "common/messaging";

const topic = "wallet/import-mnemonic-wallet";

export interface Data {
  alias: string;
  mnemonic: string;
}

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(data: Data) {
  return await sendQuery<Data, void>(topic, "internal", data);
}
