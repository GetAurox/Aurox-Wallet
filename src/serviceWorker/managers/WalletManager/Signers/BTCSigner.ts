import { EVMTransactionPayload, PrivateKeySignerStorageData, SignMessageData } from "common/types";

import { PrivateKeySigner } from "./PrivateKeySigner";
import { SignerFromMnemonicData, SignerFromPrivateKeyData, SignerSpecificAccountInfo, SignerSpecificStorageData } from "./types";

// TODO: felix
export class BTCSigner extends PrivateKeySigner<"btc"> {
  #privateKey: string;

  constructor(storage: Omit<PrivateKeySignerStorageData, "type" | "chainType">) {
    // TODO: calculate address from privateKey
    super("btc", storage);

    // TODO: validate the privateKey is correct

    this.#privateKey = storage.privateKey;
  }

  public getPrivateKey(): string {
    throw new Error("Method not implemented.");
  }
  public signTransaction(payload: EVMTransactionPayload): Promise<string> {
    throw new Error("Method not implemented.");
  }
  public signMessage({ message }: SignMessageData): Promise<string> {
    throw new Error("Method not implemented.");
  }
  protected getSignerSpecificAccountInfo(): SignerSpecificAccountInfo<"private-key"> {
    throw new Error("Method not implemented.");
  }
  protected getSignerSpecificStorageData(): SignerSpecificStorageData<"private-key"> {
    throw new Error("Method not implemented.");
  }

  static fromMnemonic({ mnemonic, accountNumber, alias, uuid }: SignerFromMnemonicData): BTCSigner {
    throw new Error("Method not implemented.");
  }

  static fromPrivateKey({ uuid, alias, privateKey }: SignerFromPrivateKeyData): BTCSigner {
    throw new Error("Method not implemented.");
  }
}
