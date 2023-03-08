import sortBy from "lodash/sortBy";

import { ChainType, PrivateKeySignerStorageData } from "common/types";
import { supportedChainTypes } from "common/config";

import { getPrivateKeySignerConstructor, PrivateKeySigner, PrivateKeySignerFromChainType, SignerFromMnemonicData } from "./Signers";

/**
 * This function constructs the key that will be used by the Map class.
 * The reason uuid is not enough is because an account with a single uuid maps to all chainTypes for addresses and signers
 * @param uuid The uuid of the account to create the key with
 * @param chainType The chainType for the key
 * @returns Returns the created key
 */
function getSignerKey(uuid: string, chainType: ChainType) {
  return `${uuid}::${chainType}`;
}

export class MnemonicWalletSignerManager {
  /**
   * Store the wallets as: uuid::chainType -> Signer, so it can be indexed to find the appropriate wallet instance quicker
   */
  #signerMap = new Map<string, PrivateKeySigner>();

  public createSignerByDerivation<T extends ChainType>(chainType: T, derivation: SignerFromMnemonicData) {
    const Signer = getPrivateKeySignerConstructor(chainType);

    const signer = Signer.fromMnemonic(derivation);

    this.#signerMap.set(getSignerKey(signer.uuid, signer.chainType), signer);

    return signer;
  }

  public createSignerFromStorage<T extends ChainType>(chainType: T, storage: Omit<PrivateKeySignerStorageData, "type" | "chainType">) {
    const Signer = getPrivateKeySignerConstructor(chainType);

    const signer = new Signer(storage);

    this.#signerMap.set(getSignerKey(signer.uuid, signer.chainType), signer);

    return signer;
  }

  public getSigner<T extends ChainType>(uuid: string, chainType: T) {
    const signer = this.#signerMap.get(getSignerKey(uuid, chainType));

    if (!signer) return null;

    return signer as PrivateKeySignerFromChainType<T>;
  }

  public getSignerOrThrow<T extends ChainType>(uuid: string, chainType: T) {
    const signer = this.#signerMap.get(getSignerKey(uuid, chainType));

    if (!signer) throw new Error("Signer was not found");

    return signer as PrivateKeySignerFromChainType<T>;
  }

  public getSigners(sort?: "asc" | "desc") {
    const signers = [...this.#signerMap.values()];

    if (sort) {
      return sortBy(signers, "accountNumber", sort);
    }

    return signers;
  }

  public getSignersOfChainType<T extends ChainType>(chainType: T, sort?: "asc" | "desc") {
    const signers = [];

    for (const signer of this.#signerMap.values()) {
      if (signer.chainType === chainType) {
        signers.push(signer as PrivateKeySignerFromChainType<T>);
      }
    }

    if (sort) {
      return sortBy(signers, "accountNumber", sort);
    }

    return signers;
  }

  public discardSignersByUUID(uuid: string) {
    for (const chainType of supportedChainTypes) {
      this.#signerMap.delete(getSignerKey(uuid, chainType));
    }
  }
}
