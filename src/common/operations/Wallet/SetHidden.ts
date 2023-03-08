import { registerQueryResponder, sendQuery } from "common/messaging";

const topic = "wallet/set-hidden";

export interface Data {
  uuid: string;
  newHiddenValue: boolean;
}

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(uuid: string, newHiddenValue: boolean) {
  return await sendQuery<Data, string>(topic, "internal", { uuid, newHiddenValue });
}
