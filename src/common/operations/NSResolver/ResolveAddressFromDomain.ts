import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { UNSDomainRecordType } from "common/types";

const topic = "ns-resolver/resolve-address-from-domain";

interface Response {
  address: string | null;
}

export interface Data {
  domain: string;
  networkIdentifier: string;
  unsDomainRecordType?: UNSDomainRecordType;
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

export async function perform({ unsDomainRecordType, domain, networkIdentifier }: Data) {
  return await sendQuery<Data, Response>(topic, "internal", { unsDomainRecordType, domain, networkIdentifier });
}
