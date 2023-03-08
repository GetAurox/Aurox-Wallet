import { registerQueryResponder, sendQuery } from "common/messaging";

const topic = "wallet/export-all-mnemonics";

export interface Data {
  password: string;
}

export interface Result {
  mnemonics: string[];
}

export function registerResponder(handler: (data: Data) => Promise<Result>) {
  return registerQueryResponder<Data, Result>(topic, [["popup"]], event => handler(event.data));
}

export async function perform(data: Data) {
  return sendQuery<Data, Result>(topic, "internal", data);
}
