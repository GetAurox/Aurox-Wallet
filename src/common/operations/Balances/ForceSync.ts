import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "balances/force-sync";

export interface Request {
  targetAssetKeys: string[];
}

const acl: SenderACL = [
  ["popup"],
  ["window", ["connect"]],
  ["web-view", ["hardware", "expanded", "onboarding"], "all"],
  ["content-script", "all"],
];

export function registerResponder(handler: (data: Request) => Promise<void>) {
  return registerQueryResponder<Request, void>(topic, acl, event => handler(event.data));
}

export async function perform(targetAssetKeys: string[]): Promise<void> {
  return await sendQuery<Request, void>(topic, "internal", { targetAssetKeys });
}
