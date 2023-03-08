import { v4 as uuidV4 } from "uuid";
import minBy from "lodash/minBy";
import { ethers } from "ethers";
import max from "lodash/max";
import produce from "immer";

import { ChainType, MnemonicAccountInfo, MnemonicWalletStorageData, TransactionPayloadFromType } from "common/types";
import { supportedChainTypes } from "common/config";

import { MnemonicWalletSignerManager } from "./MnemonicWalletSignerManager";
import { getPrivateKeySignerConstructor, PrivateKeySigner } from "./Signers";

export type MnemonicWalletManagerOptions =
  | { type: "load"; storage: MnemonicWalletStorageData }
  | { type: "new"; mnemonic: string; alias: string; imported?: boolean };

/**
 * The Mnemonic wallet manager allows the storage of a mnemonic alongside the signers
 * This Manager also allows the creation of other accounts, these accounts will have private keys derived from the original mnemonic
 */
export class MnemonicWalletManager {
  #mnemonic: string;
  #accounts: Pick<MnemonicAccountInfo, "uuid" | "alias" | "accountNumber" | "addresses" | "hidden" | "imported">[] = [];

  #signers = new MnemonicWalletSignerManager();

  constructor(options: MnemonicWalletManagerOptions) {
    if (options.type === "load") {
      const mnemonic = options.storage.mnemonic;
      const accounts = options.storage.accounts;

      this.#mnemonic = mnemonic;

      this.#accounts = accounts.map(storage => ({
        uuid: storage.uuid,
        alias: storage.alias,
        accountNumber: storage.accountNumber,
        addresses: storage.addresses,
        hidden: storage.hidden ?? false,
        imported: storage.imported ?? false,
      }));

      for (const { uuid, alias, accountNumber, addresses, privateKeys, hidden } of accounts) {
        for (const chainType of supportedChainTypes) {
          const address = addresses[chainType] ?? null;
          const privateKey = privateKeys[chainType] ?? null;

          if (address && privateKey) {
            this.#signers.createSignerFromStorage(chainType, {
              uuid,
              alias,
              address,
              privateKey,
              hidden: hidden ?? false,
            });
          } else {
            this.#signers.createSignerByDerivation(chainType, { uuid, alias, mnemonic, accountNumber });
          }
        }
      }

      return;
    }

    if (!ethers.utils.isValidMnemonic(options.mnemonic)) {
      throw new Error("Invalid Mnemonic Provided");
    }

    this.#mnemonic = options.mnemonic;

    this.createNewAccount(options.alias, null, options?.imported || false);
  }

  public getMnemonic() {
    return this.#mnemonic;
  }

  public getPrivateKey(uuid: string, chainType: ChainType) {
    return this.#signers.getSignerOrThrow(uuid, chainType).getPrivateKey();
  }

  public getDerivedAddress(chainType: ChainType, accountNumber: number): string {
    const signer = getPrivateKeySignerConstructor(chainType).fromMnemonic({
      alias: "",
      uuid: uuidV4(),
      accountNumber,
      mnemonic: this.#mnemonic,
    });

    return signer.address;
  }

  /**
   * Creates a new account within the Mnemonic manager which will be derived from the mnemonic phrases
   * @param {string} alias The alias of the new account to be created
   * @param accountNumber
   * @param imported
   */
  public createNewAccount(alias: string, accountNumber: number | null, imported = false): MnemonicAccountInfo {
    if (accountNumber !== null && this.isManagingAccountNumber(accountNumber)) {
      throw new Error("The provided account number is already managed by the wallet");
    }

    const uuid = uuidV4();
    const effectiveAccountNumber = accountNumber ?? this.getNextAccountNumber();

    const addresses = {} as Record<ChainType, string>;

    for (const chainType of supportedChainTypes) {
      const signer = this.#signers.createSignerByDerivation(chainType, {
        uuid,
        alias,
        mnemonic: this.#mnemonic,
        accountNumber: effectiveAccountNumber,
      });

      addresses[chainType] = signer.address;
    }

    const account: MnemonicAccountInfo = {
      type: "mnemonic",
      uuid,
      alias,
      accountNumber: effectiveAccountNumber,
      addresses,
      hidden: false,
      imported,
    };

    this.#accounts = [
      ...this.#accounts,
      {
        uuid,
        alias,
        accountNumber: effectiveAccountNumber,
        addresses,
        hidden: false,
        imported,
      },
    ];

    return account;
  }

  public deleteAccount(uuid: string): void {
    if (this.#accounts.length <= 1) {
      throw new Error("Cannot delete the last account");
    }

    this.#signers.discardSignersByUUID(uuid);

    this.#accounts = this.#accounts.filter(account => account.uuid !== uuid);
  }

  public setAlias(uuid: string, newAlias: string): void {
    for (const chainType of supportedChainTypes) {
      const signer = this.#signers.getSignerOrThrow(uuid, chainType);

      signer.setAlias(newAlias);
    }

    this.#accounts = produce(this.#accounts, draft => {
      const target = draft.find(account => account.uuid === uuid);

      if (target) {
        target.alias = newAlias;
      }
    });
  }

  public setHidden(uuid: string, newHidden: boolean): void {
    for (const chainType of supportedChainTypes) {
      const signer = this.#signers.getSignerOrThrow(uuid, chainType);

      signer.setHidden(newHidden);
    }

    this.#accounts = produce(this.#accounts, draft => {
      const target = draft.find(account => account.uuid === uuid);

      if (target) {
        target.hidden = newHidden;
      }
    });
  }

  /**
   * This method gets all the mnemonic account info
   */
  public getAllMnemonicAccountsInfo() {
    const result: MnemonicAccountInfo[] = [];

    for (const { uuid, alias, accountNumber, hidden, imported } of this.#accounts) {
      const addresses = {} as Record<ChainType, string>;

      for (const chainType of supportedChainTypes) {
        const signer = this.#signers.getSignerOrThrow(uuid, chainType);

        addresses[chainType] = signer.address;
      }

      result.push({ type: "mnemonic", uuid, alias, accountNumber, addresses, hidden, imported });
    }

    return result;
  }

  public getMnemonicAccountInfoByUUID(targetAccountUUID: string): MnemonicAccountInfo | null {
    for (const { uuid, alias, accountNumber, hidden, imported } of this.#accounts) {
      if (uuid === targetAccountUUID) {
        const addresses = {} as Record<ChainType, string>;

        for (const chainType of supportedChainTypes) {
          const signer = this.#signers.getSignerOrThrow(uuid, chainType);

          addresses[chainType] = signer.address;
        }

        return { type: "mnemonic", uuid, alias, accountNumber, addresses, hidden, imported };
      }
    }

    return null;
  }

  public getStorageData() {
    const storage: MnemonicWalletStorageData = { mnemonic: this.#mnemonic, accounts: [] };

    for (const account of this.#accounts) {
      const addresses = {} as Record<ChainType, string>;
      const privateKeys = {} as Record<ChainType, string>;

      for (const chainType of supportedChainTypes) {
        const signer = this.#signers.getSignerOrThrow(account.uuid, chainType);

        addresses[chainType] = signer.address;
        privateKeys[chainType] = signer.getPrivateKey();
      }

      storage.accounts.push({ type: "mnemonic", ...account, addresses, privateKeys });
    }

    return storage;
  }

  public isManagingPrivateKey(chainType: ChainType, privateKey: string): boolean {
    for (const signer of this.#signers.getSignersOfChainType(chainType)) {
      if (privateKey === signer.getPrivateKey()) {
        return true;
      }
    }

    return false;
  }

  public isManagingMnemonic(mnemonic: string): boolean {
    return this.#mnemonic === mnemonic;
  }

  public isManagingAccountNumber(accountNumber: number) {
    return !!this.#accounts.find(account => account.accountNumber === accountNumber);
  }

  public signTransaction<T extends ChainType>(chainType: T, uuid: string, payload: TransactionPayloadFromType<T>) {
    const signer = this.#signers.getSignerOrThrow(uuid, chainType) as PrivateKeySigner;

    return signer.signTransaction(payload);
  }

  public signMessage<T extends ChainType>(chainType: T, uuid: string, message: string) {
    const signer = this.#signers.getSignerOrThrow(uuid, chainType) as PrivateKeySigner;

    return signer.signMessage({ message });
  }

  public getSigner<T extends ChainType>(chainType: T, uuid: string) {
    return this.#signers.getSigner(uuid, chainType);
  }

  public getFirstVisibleAccountUUID() {
    const visibleAccounts = this.#accounts.filter(account => !(account.hidden ?? false));

    return minBy(visibleAccounts, ({ accountNumber }) => accountNumber)?.uuid ?? null;
  }

  public hasAccountUUID(accountUUID: string) {
    return !!this.#accounts.find(account => account.uuid === accountUUID);
  }

  private getNextAccountNumber() {
    const maxAccountNumber = max(this.#accounts.map(account => account.accountNumber));

    return typeof maxAccountNumber === "number" ? maxAccountNumber + 1 : 0;
  }
}
