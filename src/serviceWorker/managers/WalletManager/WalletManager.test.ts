import { v4 as uuidV4 } from "uuid";
import omitBy from "lodash/omitBy";
import range from "lodash/range";
import omit from "lodash/omit";

import { MnemonicAccountInfo } from "common/types";
import { Wallet } from "common/operations";

import { WalletManager } from "./WalletManager";

import { mnemonicMock, privateKeyMock, walletMock } from "./mocks";

const mockChromeSet = jest.fn();

jest.mock("common/storage", () => {
  let state: any = undefined;
  return {
    loadEncryptedWalletDataFromLocalArea: () => {
      return state;
    },
    saveEncryptedWalletDataToLocalArea: (data: any) => {
      mockChromeSet(data);
      state = data;
    },
  };
});

jest.setTimeout(10000);

const stripUUID = <T extends { uuid: string }>(item: T | T[]) => {
  if (item instanceof Array) return omitBy(item, "uuid");
  return omit(item, "uuid");
};

const passwordMock = "Test1234";

describe("MainWalletManager", () => {
  let manager: WalletManager;

  beforeEach(async () => {
    mockChromeSet.mockReset();

    manager = new WalletManager();
  });

  const clearManagerState = () => {
    manager.lock();
  };

  it("tests that trying to unlock a WalletManager that hasn't been setup fails", async () => {
    clearManagerState();

    await expect(manager.unlockAccounts(passwordMock)).rejects.toStrictEqual(new Error("Wallet Manager not setup"));
  });

  it("tests that giving the WalletManager an invalid mnemonic fails", async () => {
    clearManagerState();

    await expect(manager.setupNewWallet("", "Main Wallet", passwordMock)).rejects.toStrictEqual(new Error("Invalid Mnemonic Provided"));
  });
});

describe("MainWalletManager - setupNewWallet", () => {
  let manager: WalletManager;

  beforeEach(async () => {
    // state = undefined;
    mockChromeSet.mockReset();

    manager = new WalletManager();
    await manager.setupNewWallet(mnemonicMock, "Main Wallet", passwordMock);
  });

  it("tests that initializing a new user calls the chrome.storage.local.set function", async () => {
    expect(mockChromeSet).toBeCalled();
  });

  it("tests that initializing a new user returns the correct amount of EVM accounts", async () => {
    const [accountInfo] = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    expect(accountInfo.addresses["evm"]).toStrictEqual(walletMock.address);
  });

  it("tests that initializing the wallet manager, locking it, then unlocking it returns the correct accounts", async () => {
    const beforeLockingAccounts = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    manager.lock();

    await manager.unlockAccounts(passwordMock);

    const afterLockingAccounts = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    expect(beforeLockingAccounts).toStrictEqual(afterLockingAccounts);
  });

  it("tests that initializing the wallet manager, locking it and then supplying the wrong password fails", async () => {
    manager.lock();

    // await manager.unlockAccounts("Wrong password");
    await expect(manager.unlockAccounts("Wrong password")).rejects.toThrow();
  });

  it("tests that initializing the wallet manager, locking it and then supplying a password full of special characters fails as expected", async () => {
    manager.lock();

    await expect(manager.unlockAccounts("3489391hg8he8bgxx9aughdbxxxxx1????11")).rejects.toThrow();
  });

  it("tests that when a new account is created, the updates are saved to chrome storage", async () => {
    mockChromeSet.mockReset();

    await manager.createNewAccounts([{ alias: "test" }], false, passwordMock);
    expect(mockChromeSet).toBeCalled();
  });

  it("tests that deleting the first account works", async () => {
    await manager.createNewAccounts([{ alias: "New" }], false, passwordMock);
    const [accountToDelete, ...remainingAccounts] = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    await manager.deleteAccount(accountToDelete.uuid, passwordMock);

    expect(manager.getAllAccountInfo()).toStrictEqual(remainingAccounts);
  });

  it("tests that deleting and re-creating an account with the mnemonic manager, creates the same account", async () => {
    const newAccountAlias = "Main Wallet";
    await manager.createNewAccounts([{ alias: newAccountAlias }], false, passwordMock);

    const [, accountToDelete] = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    await manager.deleteAccount(accountToDelete.uuid, passwordMock);

    const [createdAccount] = await manager.createNewAccounts([{ alias: newAccountAlias }], false, passwordMock);

    expect(stripUUID(accountToDelete)).toEqual(stripUUID(createdAccount));
  });

  it("tests that deleting an imported private key account works", async () => {
    const beforeAccountInfo = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    const createdAccount = await manager.importPrivateKeySigner(
      { uuid: uuidV4(), alias: "Imported", chainType: "evm", privateKey: privateKeyMock },
      passwordMock,
    );

    await manager.deleteAccount(createdAccount.uuid, passwordMock);

    const afterDeletionAccountInfo = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    expect(beforeAccountInfo).toStrictEqual(afterDeletionAccountInfo);
  });

  it("tests that deleting the last account fails", async () => {
    const [createdAccount] = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    await expect(manager.deleteAccount(createdAccount.uuid, passwordMock)).rejects.toThrow();
  });

  // ! Skipping because its quite a slow test
  it("tests that creating 5 accounts with the mnemonic manager, deleting all the accounts and re-creating them results in the same addresses", async () => {
    const testNamePrefix = "Dummy Wallet";

    await manager.createNewAccounts(
      range(5).map(idx => ({ alias: `${testNamePrefix} ${idx}` })),
      false,
      passwordMock,
    );

    const [, ...beforeDeletingAccounts] = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    await Promise.all(beforeDeletingAccounts.map(account => manager.deleteAccount(account.uuid, passwordMock)));

    const newlyCreatedAccounts = await manager.createNewAccounts(
      // Set the alias of the first item to be the Main Wallet alias
      range(5).map((_, idx) => ({ alias: `${testNamePrefix} ${idx - 1}` })),
      false,
      passwordMock,
    );

    expect(stripUUID(beforeDeletingAccounts)).toStrictEqual(stripUUID(newlyCreatedAccounts));
  });

  it("tests that creating a new account with an account alias works", async () => {
    const testAlias = "New Account";
    await manager.createNewAccounts([{ alias: testAlias }], false, passwordMock);

    const [, createdAccount] = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    expect(createdAccount.alias).toEqual(testAlias);
    expect(createdAccount.accountNumber).toEqual(1);
  });

  const createNewWalletParams: Wallet.ImportPrivateKeySigner.Data = {
    uuid: uuidV4(),
    alias: "test",
    chainType: "evm",
    privateKey: privateKeyMock,
  };

  it("tests that importing a wallet saves the changes", async () => {
    mockChromeSet.mockReset();

    await manager.importPrivateKeySigner(createNewWalletParams, passwordMock);

    expect(mockChromeSet).toBeCalled();
  });

  it("tests that importing a wallet that has already been imported fails", async () => {
    mockChromeSet.mockReset();

    await manager.importPrivateKeySigner(createNewWalletParams, passwordMock);

    await expect(manager.importPrivateKeySigner(createNewWalletParams, passwordMock)).rejects.toStrictEqual(
      new Error("Private Key has already been imported"),
    );
  });

  it("tests that locking then unlocking the manager that has a private key wallet added, sets everything up again correctly", async () => {
    await manager.importPrivateKeySigner(createNewWalletParams, passwordMock);

    const beforeAddresses = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    manager.lock();

    await manager.unlockAccounts(passwordMock);

    const afterAddresses = manager.getAllAccountInfo() as MnemonicAccountInfo[];

    expect(beforeAddresses).toStrictEqual(afterAddresses);
  });
});
