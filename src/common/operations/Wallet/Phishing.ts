import { registerQueryResponder, sendQuery } from "common/messaging";

import { PhishingRequest, PhishingResponse } from "common/types";

const topic = "wallet/user-input-has-private-info";

export function registerResponder(handler: (data: PhishingRequest) => Promise<PhishingResponse>) {
  return registerQueryResponder<PhishingRequest, PhishingResponse>(topic, [["content-script", "all"]], event => handler(event.data));
}

export function perform(data: PhishingRequest) {
  return sendQuery<PhishingRequest, PhishingResponse>(topic, "internal", data);
}
