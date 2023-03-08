import { TypedEmitter } from "tiny-typed-emitter";
import { personalSign, signTypedData, SignTypedDataVersion } from "@metamask/eth-sig-util";
import { loadEncryptedWalletDataFromLocalArea, saveEncryptedWalletDataToLocalArea } from "common/storage";
import { CiphertextBundle, encrypt, decrypt, getPrivateKeyWithoutPrefix } from "common/crypto";
import { Wallet as WalletOps } from "common/operations";
import {
  AccountInfo,
  ChainType,
  MnemonicAccountCreationData,
  HardwareSignerAccountInfo,
  MnemonicAccountInfo,
  MnemonicWalletStorageData,
  PrivateKeySignerAccountInfo,
  SignerStorageData,
  TransactionPayloadFromType,
  SignMessageData,
  SignTypedDataPayload,
} from "common/types";

import { getPrivateKeySignerConstructor, getHardwareSignerConstructor, Signer, PrivateKeySigner } from "./Signers";
import { MnemonicWalletManager } from "./MnemonicWalletManager";

export class WalletManagerLockedError extends Error {
  constructor() {
    super("Wallet Manager is locked");
  }
}

interface StoragePayload {
  main: MnemonicWalletStorageData;
  imported: SignerStorageData[];
  importedMnemonicWallet: MnemonicWalletStorageData[];
  activeAccountUUID: string | null;
}

export interface WalletManagerEvents {
  "wallet-unlocked": () => void;
  "wallet-locked": () => void;
  "account-removed": (accountUUID: string) => void;
  "accounts-created": (accounts: MnemonicAccountInfo[]) => void;
  "account-imported-private-key": (account: PrivateKeySignerAccountInfo) => void;
  "account-imported-mnemonic-wallet": (account: MnemonicAccountInfo) => void;
  "account-imported-hardware": (account: HardwareSignerAccountInfo) => void;
  "active-account-changed": (activeAccountUUID: string | null) => void;
}

/**
 * This is the main class that will be used by the service worker to interact with the wallets
 */
export class WalletManager extends TypedEmitter<WalletManagerEvents> {
  #lockedCiphertextBundle: CiphertextBundle | null = null;

  #wallet: {
    main: MnemonicWalletManager;
    imported: Signer[];
    importedMnemonicWallets: MnemonicWalletManager[];
    activeAccountUUID: string | null;
  } | null = null;

  get hasExistingAccounts() {
    return !!this.#lockedCiphertextBundle;
  }

  get isUnlocked() {
    return !!this.#wallet;
  }

  public async initialize() {
    this.#lockedCiphertextBundle = await loadEncryptedWalletDataFromLocalArea();

    return this;
  }

  public lock() {
    this.#wallet = null;

    this.emit("wallet-locked");
  }

  public getActiveAccountUUID() {
    if (!this.#wallet) throw new WalletManagerLockedError();

    return this.#wallet.activeAccountUUID;
  }

  public getActiveAccountInfo(): AccountInfo | null {
    if (!this.#wallet) throw new WalletManagerLockedError();

    if (!this.#wallet.activeAccountUUID) return null;

    const accountInfo = this.#wallet.main.getMnemonicAccountInfoByUUID(this.#wallet.activeAccountUUID);

    if (accountInfo) return accountInfo;

    for (const importedMnemonicWallet of this.#wallet.importedMnemonicWallets) {
      const accountInfo = importedMnemonicWallet.getMnemonicAccountInfoByUUID(this.#wallet.activeAccountUUID);

      if (accountInfo) {
        return accountInfo;
      }
    }

    for (const importedAccountSigner of this.#wallet.imported) {
      if (importedAccountSigner.uuid === this.#wallet.activeAccountUUID) {
        return importedAccountSigner.getSignerAccountInfo();
      }
    }

    return null;
  }

  public getFirstMainAccountUUID() {
    if (!this.#wallet) throw new WalletManagerLockedError();

    return this.#wallet.main.getFirstVisibleAccountUUID();
  }

  /**
   * For initializing a new WalletManager class
   */
  public async setupNewWallet(mnemonic: string, firstAccountAlias: string, secret: string) {
    if (this.hasExistingAccounts || this.isUnlocked) throw new Error("Wallet is already setup");

    const main = new MnemonicWalletManager({ type: "new", mnemonic, alias: firstAccountAlias });

    const firstAccountUUID = main.getFirstVisibleAccountUUID();

    this.#wallet = { main, imported: [], activeAccountUUID: firstAccountUUID, importedMnemonicWallets: [] };

    await this.saveAll(secret);

    this.emit("wallet-unlocked");
  }

  public async importPrivateKeySigner(data: WalletOps.ImportPrivateKeySigner.Data, secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const privateKey = getPrivateKeyWithoutPrefix(data.privateKey);

    // Check if the given private key has already been imported
    for (const signer of this.#wallet.imported) {
      if (signer.chainType === data.chainType && signer instanceof PrivateKeySigner && signer.getPrivateKey() === privateKey) {
        throw new Error("Private Key has already been imported");
      }
    }

    // Check if the given private key is matching the private key of a derived mnemonic account
    if (this.#wallet.main.isManagingPrivateKey(data.chainType, privateKey)) {
      throw new Error("The private key being imported is already managed by the main wallet");
    }

    const Signer = getPrivateKeySignerConstructor(data.chainType);

    const signer = Signer.fromPrivateKey({ uuid: data.uuid, alias: data.alias, privateKey });

    this.#wallet.imported.push(signer);

    this.#wallet.activeAccountUUID = data.uuid;

    await this.saveAll(secret);

    const account = signer.getSignerAccountInfo();

    this.emit("account-imported-private-key", account);
    this.emit("active-account-changed", data.uuid);

    return account;
  }

  public async importHardwareSigner(data: WalletOps.ImportHardwareSigner.Data, secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const Signer = getHardwareSignerConstructor(data.hardwareType);

    const signer = new Signer(data);

    this.#wallet.imported.push(signer);

    this.#wallet.activeAccountUUID = data.uuid;

    await this.saveAll(secret);

    const account = signer.getSignerAccountInfo();

    this.emit("account-imported-hardware", account);
    this.emit("active-account-changed", data.uuid);

    return account;
  }

  public async importMnemonicWallet(data: WalletOps.ImportMnemonicWallet.Data, secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    // Check if the given mnemonic has already been imported
    for (const wallet of this.#wallet.importedMnemonicWallets) {
      if (wallet.isManagingMnemonic(data.mnemonic)) {
        throw new Error("Mnemonic has already been imported");
      }
    }

    // Check if the given mnemonic is already been imported
    if (this.#wallet.main.isManagingMnemonic(data.mnemonic)) {
      throw new Error("The mnemonic being imported is already managed by the main wallet");
    }

    const mnemonicWallet = new MnemonicWalletManager({
      type: "new",
      mnemonic: data.mnemonic,
      alias: data.alias,
      imported: true,
    });

    const firstAccountUUID = mnemonicWallet.getFirstVisibleAccountUUID();

    this.#wallet.importedMnemonicWallets.push(mnemonicWallet);

    this.#wallet.activeAccountUUID = firstAccountUUID;

    await this.saveAll(secret);

    const account = mnemonicWallet.getMnemonicAccountInfoByUUID(firstAccountUUID as string) as MnemonicAccountInfo;

    this.emit("account-imported-mnemonic-wallet", account);
    this.emit("active-account-changed", firstAccountUUID);

    return account;
  }

  public getDerivedAddresses(chainType: ChainType, accountNumbers: number[]) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    return accountNumbers.map(accountNumber => this.#wallet!.main.getDerivedAddress(chainType, accountNumber));
  }

  /**
   * This function creates new derived accounts in batch ignoring the ones that already exist
   * @param {MnemonicAccountCreationData[]} items The creation data of the new accounts to be created
   * @param {boolean} skipAccountSwitching If false this method sets the active account to the first on the created accounts
   * @param {string} secret Password
   * @returns The accounts that have actually been added
   */
  public async createNewAccounts(items: MnemonicAccountCreationData[], skipAccountSwitching: boolean, secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    if (items.length === 0) return [];

    const newAccounts = [];

    for (const { alias, accountNumber } of items) {
      if (typeof accountNumber !== "number" || !this.#wallet.main.isManagingAccountNumber(accountNumber)) {
        newAccounts.push(this.#wallet.main.createNewAccount(alias, accountNumber ?? null));
      }
    }

    if (newAccounts.length === 0) return [];

    if (!skipAccountSwitching) {
      this.#wallet.activeAccountUUID = newAccounts[0].uuid;
    }

    await this.saveAll(secret);

    this.emit("accounts-created", newAccounts);

    if (!skipAccountSwitching) {
      this.emit("active-account-changed", newAccounts[0].uuid);
    }

    return newAccounts;
  }

  public async deleteAccount(uuid: string, secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    // Determine if the given UUID is an imported signer. Do this check first before calling the mnemonic manager deleteAccount method, so that it won't throw a last account error if its an imported signer
    const importedSigner = this.#wallet.imported.find(signer => signer.uuid === uuid);
    const importedMnemonicWallet = this.#wallet.importedMnemonicWallets.find(wallet => wallet.hasAccountUUID(uuid));

    if (importedSigner) {
      this.#wallet.imported = this.#wallet.imported.filter(signer => signer.uuid !== uuid);
    } else if (importedMnemonicWallet) {
      this.#wallet.importedMnemonicWallets = this.#wallet.importedMnemonicWallets.filter(wallet => !wallet.hasAccountUUID(uuid));
    } else {
      this.#wallet.main.deleteAccount(uuid);
    }

    let activeAccountChanged = false;

    if (this.#wallet.activeAccountUUID === uuid) {
      this.#wallet.activeAccountUUID = this.#wallet.main.getFirstVisibleAccountUUID();

      activeAccountChanged = true;
    }

    await this.saveAll(secret);

    if (activeAccountChanged) {
      this.emit("active-account-changed", this.#wallet.activeAccountUUID);
    }

    this.emit("account-removed", uuid);
  }

  public getPrivateKey(uuid: string, chainType: ChainType) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const signer = this.getSigner(chainType, uuid);

    if (!signer) throw new Error("The account does not exist");

    // Can only export private keys from private-key signers or through the mnemonic manager
    if (signer instanceof PrivateKeySigner) {
      return signer.getPrivateKey();
    }

    throw new Error("cannot export hardware account private-key");
  }

  public getMainMnemonic(): string {
    if (!this.#wallet) throw new WalletManagerLockedError();

    return this.#wallet.main.getMnemonic();
  }

  public getAllMnemonics(): string[] {
    if (!this.#wallet) throw new WalletManagerLockedError();

    return [this.#wallet.main.getMnemonic(), ...this.#wallet.importedMnemonicWallets.map(wallet => wallet.getMnemonic())];
  }

  public getAddress(uuid: string, chainType: ChainType): string | null {
    if (!this.#wallet) throw new WalletManagerLockedError();

    return this.getSigner(chainType, uuid)?.address ?? null;
  }

  public getAllAccountInfo(): AccountInfo[] {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const accountInfo = this.#wallet.main.getAllMnemonicAccountsInfo();

    return [
      ...accountInfo,
      ...this.#wallet.imported.map(imported => imported.getSignerAccountInfo()),
      ...this.#wallet.importedMnemonicWallets.flatMap(wallet => wallet.getAllMnemonicAccountsInfo()),
    ];
  }

  /**
   * This function tries to decrypt the users data with the given secret. If it fails to decrypt it will throw an error.
   * @param secret The secret to try and unlock with
   */
  async unlockAccounts(secret: string) {
    // noop when Already unlocked
    if (this.#wallet) return;

    if (!this.#lockedCiphertextBundle) throw new Error("Wallet Manager not setup");

    const { plaintext } = await decrypt(this.#lockedCiphertextBundle, secret);

    const payload = JSON.parse(plaintext) as StoragePayload;

    const main = new MnemonicWalletManager({ type: "load", storage: payload.main });

    const imported = payload.imported.map(storage => {
      // If its recovering a private key wallet
      if (storage.type === "private-key") {
        const PrivateKeySigner = getPrivateKeySignerConstructor(storage.chainType);

        return new PrivateKeySigner(storage);
      }

      const HardwareSigner = getHardwareSignerConstructor(storage.hardwareType);

      return new HardwareSigner(storage);
    });

    const importedMnemonicWallets = (payload.importedMnemonicWallet ?? []).map(
      storage =>
        new MnemonicWalletManager({
          type: "load",
          storage: storage,
        }),
    );

    this.#wallet = {
      main,
      imported,
      activeAccountUUID: payload.activeAccountUUID,
      importedMnemonicWallets: importedMnemonicWallets,
    };

    this.emit("wallet-unlocked");
  }

  public signTransaction<T extends ChainType>(chainType: T, uuid: string, payload: TransactionPayloadFromType<T>) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const signer = this.getSigner(chainType, uuid);

    if (!signer) throw new Error("The account selected for transaction signing does not exist");

    if (!(signer instanceof PrivateKeySigner)) {
      throw new Error(`The wallet cannot sign transactions for a ${signer.type} account`);
    }

    return signer.signTransaction(payload);
  }

  public signMessage(payload: SignMessageData) {
    const { chainType, uuid, message, unsafeWithoutPrefix, shouldArrayify } = payload;

    if (!this.#wallet) throw new WalletManagerLockedError();

    const signer = this.getSigner(chainType, uuid);

    if (!signer) throw new Error("The account selected for transaction signing does not exist");

    if (!(signer instanceof PrivateKeySigner)) {
      throw new Error(`The wallet cannot sign messages for a ${signer.type} account`);
    }

    if (!unsafeWithoutPrefix) {
      const privateKey = signer.getPrivateKey();

      const bufferPrivateKey = Buffer.from(privateKey, "hex");

      return personalSign({ privateKey: bufferPrivateKey, data: message });
    }

    return signer.signMessage({ message, unsafeWithoutPrefix, shouldArrayify });
  }

  public async signTypedData(accountUUID: string, data: SignTypedDataPayload) {
    const privateKey = this.getPrivateKey(accountUUID, "evm");

    const privateKeyHex = Buffer.from(privateKey, "hex");

    return signTypedData({ privateKey: privateKeyHex, data, version: SignTypedDataVersion.V4 });
  }

  public async setAlias(uuid: string, newAlias: string, secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const importedWallet = this.#wallet.imported.find(signer => signer.uuid === uuid);
    const importedMnemonicWallet = this.#wallet.importedMnemonicWallets.find(wallet => wallet.hasAccountUUID(uuid));

    if (importedWallet) {
      importedWallet.setAlias(newAlias);
    } else if (importedMnemonicWallet) {
      importedMnemonicWallet.setAlias(uuid, newAlias);
    } else {
      this.#wallet.main.setAlias(uuid, newAlias);
    }

    await this.saveAll(secret);
  }

  public async setHidden(uuid: string, newHidden: boolean, secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const importedWallet = this.#wallet.imported.find(signer => signer.uuid === uuid);
    const importedMnemonicWallet = this.#wallet.importedMnemonicWallets.find(wallet => wallet.hasAccountUUID(uuid));

    if (importedWallet) {
      importedWallet.setHidden(newHidden);
    } else if (importedMnemonicWallet) {
      importedMnemonicWallet.setHidden(uuid, newHidden);
    } else {
      this.#wallet.main.setHidden(uuid, newHidden);
    }

    let activeAccountChanged = false;

    if (this.#wallet.activeAccountUUID === uuid) {
      this.#wallet.activeAccountUUID = this.getFirstOverallVisibleAccountUUID();

      activeAccountChanged = true;
    }

    await this.saveAll(secret);

    if (activeAccountChanged) {
      this.emit("active-account-changed", this.#wallet.activeAccountUUID);
    }
  }

  public getFirstOverallVisibleAccountUUID() {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const mainAccountUUID = this.#wallet.main.getFirstVisibleAccountUUID();

    if (mainAccountUUID) {
      return mainAccountUUID;
    }

    for (const mnemonicWallets of this.#wallet.importedMnemonicWallets) {
      const accountUUID = mnemonicWallets.getFirstVisibleAccountUUID();

      if (accountUUID) {
        return accountUUID;
      }
    }

    return this.#wallet.imported.find(signer => !signer.hidden)?.getSignerAccountInfo().uuid ?? null;
  }

  public async setActiveAccountUUID(activeAccountUUID: string, secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    if (!this.hasAccountUUID(activeAccountUUID)) {
      throw new Error("The provided account does not exist");
    }

    this.#wallet.activeAccountUUID = activeAccountUUID;

    await this.saveAll(secret);

    this.emit("active-account-changed", activeAccountUUID);
  }

  /**
   * This method updates the users password
   * @param oldSecret The oldSecret to try and decrypt with
   * @param newSecret The newSecret to encrypt the data with
   */
  public async updatePassword(oldSecret: string, newSecret: string): Promise<void> {
    if (!this.#lockedCiphertextBundle) {
      throw new Error("Wallet Manager not setup");
    }

    // try to decrypt with the oldSecret first
    const { plaintext } = await decrypt(this.#lockedCiphertextBundle, oldSecret);

    // If decryption is successful save the changes with the new password
    await this.encryptAndPersist(plaintext, newSecret);
  }

  /**
   * This function gets all the relevant data from the attached private key wallets and encrypts it with the given secret, this data is then saved locally
   * @param secret The secret to encrypt all the plaintext data with
   */
  private async saveAll(secret: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const payload: StoragePayload = {
      main: this.#wallet.main.getStorageData(),
      imported: this.#wallet.imported.map(signer => signer.getSignerStorageData()),
      importedMnemonicWallet: this.#wallet.importedMnemonicWallets.map(mnemonicWallet => mnemonicWallet.getStorageData()),
      activeAccountUUID: this.#wallet.activeAccountUUID,
    };

    const plaintext = JSON.stringify(payload);

    await this.encryptAndPersist(plaintext, secret);
  }

  private async encryptAndPersist(plaintext: string, secret: string) {
    // Encrypt the wallets using the associated encryption class
    const ciphertextBundle = await encrypt(plaintext, secret);

    // Override the data
    await saveEncryptedWalletDataToLocalArea(ciphertextBundle);

    // Need to update the cipher text for the manager
    this.#lockedCiphertextBundle = ciphertextBundle;
  }

  private getSigner(chainType: ChainType, uuid: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    const signerFromMain = this.#wallet.main.getSigner(chainType, uuid);

    if (signerFromMain) {
      return signerFromMain;
    }

    const signerFromImportedWallets = this.#wallet.importedMnemonicWallets.find(wallet => wallet.getSigner(chainType, uuid) !== null);

    if (signerFromImportedWallets) {
      return signerFromImportedWallets.getSigner(chainType, uuid);
    }

    return this.#wallet.imported.find(signer => signer.uuid === uuid && signer.chainType === chainType) ?? null;
  }

  private hasAccountUUID(accountUUID: string) {
    if (!this.#wallet) throw new WalletManagerLockedError();

    if (this.#wallet.main.hasAccountUUID(accountUUID)) {
      return true;
    }

    for (const mnemonicWallet of this.#wallet.importedMnemonicWallets) {
      if (mnemonicWallet.hasAccountUUID(accountUUID)) {
        return true;
      }
    }

    return !!this.#wallet.imported.find(signer => signer.uuid === accountUUID);
  }
}
