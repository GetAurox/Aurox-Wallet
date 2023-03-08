import { registerQueryResponder, sendQuery } from "common/messaging";

const topic = "password/authenticate";

export interface Data {
  password: string;
}

export interface Result {
  verified: boolean;
}

export function registerResponder(handler: (data: Data) => Promise<Result>) {
  return registerQueryResponder<Data, Result>(topic, [["popup"], ["window", ["connect"]]], event => handler(event.data));
}

export async function perform(password: string) {
  return await sendQuery<Data, Result>(topic, "internal", { password });
}
