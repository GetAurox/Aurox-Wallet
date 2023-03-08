import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "password/create-password";

export interface Data {
  newPassword: string;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["onboarding"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<void>) {
  return registerQueryResponder<Data, void>(topic, acl, event => handler(event.data));
}

export async function perform(newPassword: string) {
  await sendQuery<Data, void>(topic, "internal", { newPassword });
}
