import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { SignTypedDataPayload } from "common/types";
import { getTimeInMilliseconds } from "common/utils";

const topic = "wallet/sign-typed-data-v2";

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["web-view", ["onboarding"], "all"]];

export interface Data {
  accountUUID: string;

  data: SignTypedDataPayload;

  dappOperationId?: string;
}

export function registerResponder(handler: (data: Data) => Promise<string>) {
  return registerQueryResponder<Data, string>(topic, acl, event => handler(event.data));
}

export async function perform(data: Data) {
  return await sendQuery<Data, string>(topic, "internal", data, {
    timeout: getTimeInMilliseconds({ unit: "minute", amount: 15 }),
  });
}
