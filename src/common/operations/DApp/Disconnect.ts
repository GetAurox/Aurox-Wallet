import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "dapp/disconnect";

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["content-script", "all"]];

export interface Request {
  domain: string;
  tabId: number;
}

export function registerResponder(handler: (data: Request) => Promise<void>) {
  return registerQueryResponder<Request, void>(topic, acl, event => handler(event.data));
}

export async function perform(data: Request): Promise<void> {
  return await sendQuery<Request, void>(topic, "internal", data);
}
