import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { Wallet, utils, Bytes } from "ethers";
import { joinSignature } from "ethers/lib/utils";

import { EVMTransactionPayload, PrivateKeySignerStorageData, SignMessageData } from "common/types";
import { getEVMSignerPath } from "common/wallet";

import { getPrivateKeyWithoutPrefix } from "common/crypto";

import { SignerFromMnemonicData, SignerFromPrivateKeyData, SignerSpecificAccountInfo, SignerSpecificStorageData } from "./types";
import { PrivateKeySigner } from "./PrivateKeySigner";

/**
 * This Private Key account manager allows the storage of a single private key.
 * This is to be used whenever a user imports their private key for an additional account, specifically an EVM account
 */
export class EVMSigner extends PrivateKeySigner<"evm"> {
  #privateKey: string;

  #wallet: Wallet;

  constructor(storage: Omit<PrivateKeySignerStorageData, "type" | "chainType">) {
    super("evm", storage);

    try {
      // This try-catch only exists to validate that the privateKey is valid
      this.#wallet = new Wallet(storage.privateKey);
    } catch {
      // Throw with a useful error
      throw new Error("Invalid Private Key Provided");
    }

    this.#privateKey = storage.privateKey;
  }

  getPrivateKey() {
    return getPrivateKeyWithoutPrefix(this.#privateKey);
  }

  public signTransaction(payload: EVMTransactionPayload): Promise<string> {
    return this.#wallet.signTransaction(payload.params);
  }

  /**
   * Returns a signed message
   * @returns The signed message
   */
  public signMessage(payload: Pick<SignMessageData, "message" | "unsafeWithoutPrefix" | "shouldArrayify">): Promise<string> | string {
    const { message, unsafeWithoutPrefix, shouldArrayify } = payload;

    let messageToSign: string | Bytes = message;

    if (shouldArrayify) {
      messageToSign = utils.arrayify(messageToSign);
    }

    if (!unsafeWithoutPrefix) return this.#wallet.signMessage(messageToSign);

    return joinSignature(this.#wallet._signingKey().signDigest(messageToSign));
  }

  public signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, value: Record<string, any>) {
    return this.#wallet._signTypedData(domain, types, value);
  }

  protected getSignerSpecificAccountInfo(): SignerSpecificAccountInfo<"private-key"> {
    return {};
  }

  protected getSignerSpecificStorageData(): SignerSpecificStorageData<"private-key"> {
    return { privateKey: this.#privateKey };
  }

  static fromMnemonic({ mnemonic, accountNumber, alias, uuid }: SignerFromMnemonicData) {
    const path = getEVMSignerPath(accountNumber);

    const { address, privateKey } = Wallet.fromMnemonic(mnemonic, path);

    return new EVMSigner({ uuid, alias, address, privateKey });
  }

  static fromPrivateKey({ uuid, alias, privateKey }: SignerFromPrivateKeyData) {
    const { address } = new Wallet(privateKey);

    return new EVMSigner({ uuid, alias, address, privateKey });
  }
}
