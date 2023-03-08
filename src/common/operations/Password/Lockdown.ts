import { registerQueryResponder, sendQuery } from "common/messaging";

const topic = "password/lockdown";

export function registerResponder(handler: () => Promise<void>) {
  return registerQueryResponder<void, void>(topic, [["popup"]], () => handler());
}

export async function perform() {
  return await sendQuery<void, void>(topic, "internal", undefined);
}
