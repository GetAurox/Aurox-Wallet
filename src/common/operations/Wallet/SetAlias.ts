import { registerQueryResponder, sendQuery } from "common/messaging";

const topic = "wallet/set-alias";

export interface Data {
  uuid: string;
  newAlias: string;
}

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(uuid: string, newAlias: string) {
  return await sendQuery<Data, string>(topic, "internal", { uuid, newAlias });
}
