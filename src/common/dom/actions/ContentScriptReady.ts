import { registerDOMQueryResponder, sendDOMQuery } from "../messaging";

const topic = "content-script-ready";

export interface Result {
  ready: boolean;
}

export function registerResponder(handler: () => Promise<Result>) {
  return registerDOMQueryResponder<void, Result>(topic, handler);
}

export async function wait() {
  while (true) {
    const { ready } = await sendDOMQuery<void, Result>(topic, undefined);

    if (ready) {
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
