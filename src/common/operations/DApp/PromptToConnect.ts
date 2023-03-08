import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "dapp/prompt-to-connect";

export interface Request {
  origin: string;
}

export interface Result {
  response: "accepted" | "rejected";
}

const acl: SenderACL = [
  ["window", ["connect"]],
  ["content-script", "all"],
];

export function registerResponder(handler: (data: Request) => Promise<Result>) {
  return registerQueryResponder<Request, Result>(topic, acl, event => {
    return handler({ origin: event.sender.origin ?? "" });
  });
}

export async function perform(): Promise<Result> {
  return await sendQuery<null, Result>(topic, "internal", null, { timeout: 5 * 60 * 1000 });
}
