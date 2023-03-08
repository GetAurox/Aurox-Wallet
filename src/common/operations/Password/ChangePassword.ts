import { registerQueryResponder, sendQuery } from "common/messaging";

const topic = "password/change-password";

export interface Data {
  oldPassword: string;
  newPassword: string;
}

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(oldPassword: string, newPassword: string) {
  await sendQuery<Data, void>(topic, "internal", { oldPassword, newPassword });
}
