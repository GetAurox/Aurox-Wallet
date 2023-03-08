import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "ens/add-ens";

interface Response {
  status: boolean;
  error?: string;
}

export interface Data {
  subdomain: string;
}

const acl: SenderACL = [["web-view", ["onboarding"], "all"]];

export function registerResponder(handler: (data: Data) => Promise<Response>) {
  return registerQueryResponder<Data, Response>(topic, acl, event => handler(event.data));
}

export async function perform(subdomain: string) {
  return await sendQuery<Data, Response>(topic, "internal", { subdomain });
}
