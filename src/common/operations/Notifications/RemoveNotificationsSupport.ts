import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "notifications/remove-notifications-support";

const acl: SenderACL = [
  ["popup"],
  ["window", ["connect"]],
  ["web-view", ["hardware", "expanded", "onboarding"], "all"],
  ["content-script", "all"],
];

export function registerResponder(handler: () => Promise<boolean>) {
  return registerQueryResponder<{}, boolean>(topic, acl, () => handler());
}

export async function perform(): Promise<boolean> {
  return await sendQuery<{}, boolean>(topic, "internal", {});
}
