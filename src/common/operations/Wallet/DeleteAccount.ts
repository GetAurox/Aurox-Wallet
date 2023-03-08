import { registerQueryResponder, sendQuery } from "common/messaging";

const topic = "wallet/delete-account";

export interface Data {
  uuid: string;
}

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(uuid: string) {
  return await sendQuery<Data, void>(topic, "internal", { uuid });
}
