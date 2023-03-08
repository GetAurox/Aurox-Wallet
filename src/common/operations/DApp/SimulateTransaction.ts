import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";

const topic = "dapp/simulate-transaction";

export interface Request {
  operationId: string;

  simulated: boolean;
}

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["content-script", "all"]];

export function registerResponder(handler: (data: Request) => Promise<void>) {
  return registerQueryResponder<Request, void>(topic, acl, event => handler(event.data));
}

export async function perform(operationId: string, simulated: boolean): Promise<void> {
  return await sendQuery<Request, void>(topic, "internal", { operationId, simulated });
}
