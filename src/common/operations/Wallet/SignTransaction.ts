import { registerQueryResponder, sendQuery } from "common/messaging";
import { ChainType, TransactionPayloadFromType } from "common/types";

const topic = "wallet/sign-transaction";

export interface Data<T extends ChainType = ChainType> {
  chainType: T;
  uuid: string;
  payload: TransactionPayloadFromType<T>;
}

export function registerResponder(handler: (data: Data) => Promise<string>) {
  return registerQueryResponder<Data, string>(topic, [["popup"], ["window", ["connect"]]], event => handler(event.data));
}

export async function perform<T extends ChainType = ChainType>(
  chainType: T,
  uuid: string,
  payload: Omit<TransactionPayloadFromType<T>, "type">,
) {
  const payloadWithType = { type: chainType, ...payload } as TransactionPayloadFromType<T>;

  return await sendQuery<Data<T>, string>(topic, "internal", { chainType, uuid, payload: payloadWithType });
}
