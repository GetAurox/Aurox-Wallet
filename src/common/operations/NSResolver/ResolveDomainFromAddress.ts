import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "ns-resolver/resolve-domain-from-address";

interface Response {
  domain: string | null;
}

export interface Data {
  address: string;
  networkIdentifier: string;
}

const acl: SenderACL = [
  ["popup"],
  ["window", ["connect"]],
  ["web-view", ["hardware", "expanded", "onboarding"], "all"],
  ["content-script", "all"],
];

export function registerResponder(handler: (data: Data) => Promise<Response>) {
  return registerQueryResponder<Data, Response>(topic, acl, event => handler(event.data));
}

export async function perform({ address, networkIdentifier }: Data) {
  return await sendQuery<Data, Response>(topic, "internal", { address, networkIdentifier });
}
