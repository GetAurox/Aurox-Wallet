import { ChainType, SignerAccountInfoBase, TransactionPayloadFromType, SignMessageData } from "common/types";

import { Signer } from "./Signer";

export abstract class PrivateKeySigner<T extends ChainType = ChainType> extends Signer<"private-key"> {
  constructor(chainType: T, accountInfo: Omit<SignerAccountInfoBase, "chainType">) {
    super("private-key", { chainType, ...accountInfo });
  }

  public abstract getPrivateKey(): string;

  public abstract signTransaction(payload: TransactionPayloadFromType<T>): Promise<string>;

  public abstract signMessage(
    payload: Pick<SignMessageData, "message" | "unsafeWithoutPrefix" | "shouldArrayify">,
  ): Promise<string> | string;
}
