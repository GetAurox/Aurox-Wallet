import { registerQueryResponder, SenderACL, sendQuery } from "common/messaging";
import { ProviderRpcError } from "common/errors";
import { getDomainFromHostname } from "common/chrome";

const topic = "dapp/internal-rpc-request";

export interface Request<Params = unknown[]> {
  method: string;
  params?: Params;
  documentTitle: string;
}

export interface InterceptedRequest<Params = unknown[]> {
  method: string;
  params?: Params;
  domain: string;
  tabId: number;
  documentTitle: string;
}

export type Response = object | string[] | string | number | null;

const acl: SenderACL = [["popup"], ["window", ["connect"]], ["content-script", "all"]];

export function registerResponder(handler: (data: InterceptedRequest) => Promise<Response>) {
  return registerQueryResponder<InterceptedRequest, Response>(topic, acl, event => {
    const url = new URL(event.sender.origin ?? "");

    const tabId = event.sender.tab?.id;

    if (typeof tabId !== "number") {
      throw new Error("Can not process request, tabId is unknown");
    }

    const domain = getDomainFromHostname(url.hostname);

    if (!domain) {
      throw new Error(`Failed to parse domain from ${url.host}`);
    }

    const { method, params, documentTitle } = event.data;

    return handler({ domain, method, params, documentTitle, tabId });
  });
}

export async function perform(data: Request): Promise<Response> {
  try {
    return await sendQuery<Request, Response>(topic, "internal", data, { timeout: 15 * 60 * 1000 });
  } catch (error) {
    const rpcError = ProviderRpcError.parseError(error);

    if (rpcError.code) {
      throw new ProviderRpcError(rpcError.code);
    }

    throw rpcError;
  }
}
