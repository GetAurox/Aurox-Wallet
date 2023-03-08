import { MnemonicWalletManager } from "./MnemonicWalletManager";
import { mnemonicMock, walletMock } from "./mocks";

const alias = "Test Alias";

describe("MnemonicWalletManager", () => {
  it("tests that the private key can be exported for a given evm address", () => {
    const manager = new MnemonicWalletManager({ type: "new", mnemonic: mnemonicMock, alias });

    const firstAccountUUID = manager.getAllMnemonicAccountsInfo()[0].uuid;

    expect(manager.getPrivateKey(firstAccountUUID, "evm")).toEqual(walletMock.privateKey);
  });

  it("tests that the private key can be exported for a given solana address", () => {
    const manager = new MnemonicWalletManager({ type: "new", mnemonic: mnemonicMock, alias });

    const firstAccountUUID = manager.getAllMnemonicAccountsInfo()[0].uuid;

    expect(manager.getPrivateKey(firstAccountUUID, "solana")).resolves;
  });

  it("tests that exportMnemonicAccountInfo function works correctly when the manager is just created", () => {
    const manager = new MnemonicWalletManager({ type: "new", mnemonic: mnemonicMock, alias });

    const accountsInfo = manager.getAllMnemonicAccountsInfo();

    expect(accountsInfo.length).toEqual(1);
    expect(accountsInfo[0].accountNumber).toEqual(0);
    expect(accountsInfo[0].alias).toEqual(alias);
    expect(accountsInfo[0].addresses.evm).toEqual(walletMock.address);
  });

  it("tests that exportMnemonicAccountInfo function works correctly after a few accounts have been created", () => {
    const expectedAliases = ["Alias 1", "Alias 2", "Alias 3"];

    const manager = new MnemonicWalletManager({ type: "new", mnemonic: mnemonicMock, alias: expectedAliases[0] });

    for (const alias of expectedAliases.slice(1)) {
      manager.createNewAccount(alias, null);
    }

    const accountsInfo = manager.getAllMnemonicAccountsInfo();

    expect(accountsInfo.length).toEqual(3);

    for (const [idx, account] of accountsInfo.entries()) {
      expect(account.accountNumber).toEqual(idx);

      expect(account.alias).toEqual(expectedAliases[idx]);
    }
  });
});
