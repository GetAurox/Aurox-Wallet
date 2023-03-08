import { SecureWalletState } from "common/states";
import { mnemonicsToString } from "common/bip39";
import { Wallet } from "common/operations";

import { WalletManager, PasswordManager } from "serviceWorker/managers";
import { AccountInfo, ChainType, PhishingInputType, PhishingResponse } from "common/types";

function setAccountsInfoOnDraft(draft: SecureWalletState.Data, manager: WalletManager) {
  const accounts = manager.getAllAccountInfo();

  draft.accounts = Object.fromEntries(accounts.map(account => [account.uuid, account]));
  draft.accountUUIDs = accounts.map(account => account.uuid);
  draft.activeAccountUUID = draft.activeAccountUUID ?? manager.getActiveAccountUUID() ?? manager.getFirstMainAccountUUID();
}

function addNewAccountsToDraft(draft: SecureWalletState.Data, accounts: AccountInfo[], skipAccountSwitching?: boolean) {
  for (const account of accounts) {
    draft.accounts[account.uuid] = account;
    draft.accountUUIDs.push(account.uuid);
  }

  if (!skipAccountSwitching && accounts.length > 0) {
    draft.activeAccountUUID = accounts[0].uuid;
  }
}

export async function setupWalletService(passwordManager: PasswordManager) {
  const manager = await new WalletManager().initialize();

  const defaultProviderState = {
    ...SecureWalletState.buildDefault(),
    isWalletSetup: manager.hasExistingAccounts,
  };

  // This is a workaround for SW5MinuteDeathmark, in case the password was recalled we need to setup the provider accordingly
  if (manager.hasExistingAccounts && passwordManager.isPasswordVerified) {
    await passwordManager.usePassword(async password => {
      await manager.unlockAccounts(password);
    });

    defaultProviderState.isWalletUnlocked = true;

    setAccountsInfoOnDraft(defaultProviderState, manager);
  }

  const provider = SecureWalletState.buildProvider(defaultProviderState);

  passwordManager.addListener("password-ready", () => {
    if (!manager.hasExistingAccounts) {
      return;
    }

    passwordManager.usePassword(async password => {
      await manager.unlockAccounts(password);

      await provider.update(draft => {
        draft.isWalletUnlocked = true;

        setAccountsInfoOnDraft(draft, manager);
      });
    });
  });

  passwordManager.addListener("password-changed", oldPassword => {
    passwordManager.usePassword(async newPassword => {
      await manager.updatePassword(oldPassword, newPassword);
    });
  });

  passwordManager.addListener("password-lockdown", async () => {
    manager.lock();

    await provider.update(() => ({
      ...SecureWalletState.buildDefault(),
      isWalletSetup: manager.hasExistingAccounts,
    }));
  });

  /**
   * Wallet Listeners
   */
  Wallet.Setup.registerResponder(async ({ setupMethod, mnemonics, firstAccountAlias }) => {
    await passwordManager.usePassword(async password => {
      await manager.setupNewWallet(mnemonicsToString(mnemonics), firstAccountAlias, password);

      await provider.update(draft => {
        draft.setupMethod = setupMethod;
        draft.isWalletSetup = true;
        draft.isWalletUnlocked = true;

        setAccountsInfoOnDraft(draft, manager);
      });
    });
  });

  Wallet.ImportPrivateKeySigner.registerResponder(async data => {
    await passwordManager.usePassword(async password => {
      const newAccount = await manager.importPrivateKeySigner(data, password);

      await provider.update(draft => {
        addNewAccountsToDraft(draft, [newAccount]);
      });
    });
  });

  Wallet.ImportHardwareSigner.registerResponder(async data => {
    await passwordManager.usePassword(async password => {
      const newAccount = await manager.importHardwareSigner(data, password);

      await provider.update(draft => {
        addNewAccountsToDraft(draft, [newAccount]);
      });
    });
  });

  Wallet.ImportMnemonicWallet.registerResponder(async data => {
    await passwordManager.usePassword(async password => {
      const newAccount = await manager.importMnemonicWallet(data, password);

      await provider.update(draft => {
        addNewAccountsToDraft(draft, [newAccount]);
      });
    });
  });

  Wallet.GetDerivedAddresses.registerResponder(async data => manager.getDerivedAddresses(data.chainType, data.accountNumbers));

  Wallet.CreateNewMnemonicAccounts.registerResponder(async data => {
    return await passwordManager.usePassword(async password => {
      const newAccounts = await manager.createNewAccounts(data.items, data.skipAccountSwitching, password);

      await provider.update(draft => {
        addNewAccountsToDraft(draft, newAccounts, data.skipAccountSwitching);
      });
    });
  });

  Wallet.DeleteAccount.registerResponder(async ({ uuid }) => {
    await passwordManager.usePassword(async password => {
      await manager.deleteAccount(uuid, password);

      await provider.update(draft => {
        setAccountsInfoOnDraft(draft, manager);

        if (draft.activeAccountUUID === uuid) {
          draft.activeAccountUUID = manager.getFirstMainAccountUUID();
        }
      });
    });
  });

  Wallet.SetAlias.registerResponder(async ({ uuid, newAlias }) => {
    await passwordManager.usePassword(async password => {
      await manager.setAlias(uuid, newAlias, password);

      await provider.update(draft => {
        draft.accounts[uuid].alias = newAlias;
      });
    });
  });

  Wallet.SetHidden.registerResponder(async ({ uuid, newHiddenValue }) => {
    await passwordManager.usePassword(async password => {
      await manager.setHidden(uuid, newHiddenValue, password);

      await provider.update(draft => {
        draft.accounts[uuid].hidden = newHiddenValue;

        if (draft.activeAccountUUID === uuid) {
          draft.activeAccountUUID = manager.getFirstOverallVisibleAccountUUID();
        }
      });
    });
  });

  Wallet.SwitchAccount.registerResponder(async ({ switchToUUID }) => {
    await passwordManager.usePassword(async password => {
      await manager.setActiveAccountUUID(switchToUUID, password);

      await provider.update(draft => {
        if (draft.accounts[switchToUUID]) {
          draft.activeAccountUUID = switchToUUID;
        }
      });
    });
  });

  Wallet.ExportPrivateKey.registerResponder(async ({ uuid, chainType, password }) => {
    const valid = await passwordManager.probe(password);

    if (!valid) {
      throw new Error("Password is invalid");
    }

    return { privateKey: manager.getPrivateKey(uuid, chainType) };
  });

  Wallet.SignMessage.registerResponder(async ({ chainType, uuid, message, unsafeWithoutPrefix, shouldArrayify }) => {
    return manager.signMessage({ chainType, uuid, message, unsafeWithoutPrefix, shouldArrayify });
  });

  Wallet.SignTransaction.registerResponder(async ({ chainType, uuid, payload }) => {
    return manager.signTransaction(chainType, uuid, payload);
  });

  Wallet.ExportAllMnemonics.registerResponder(async ({ password }) => {
    const valid = await passwordManager.probe(password);

    if (!valid) {
      throw new Error("Password is invalid");
    }

    return { mnemonics: manager.getAllMnemonics() };
  });

  Wallet.Phishing.registerResponder(async data => {
    const response: PhishingResponse = {
      current: { hasMnemonic: false, hasPrivateKey: false },
      accumulated: { hasMnemonic: false, hasPrivateKey: false },
    };

    if (manager.isUnlocked) {
      const allMnemonic = manager.getAllMnemonics();

      for (const [inputType, inputValue] of Object.entries(data)) {
        response[inputType as PhishingInputType].hasMnemonic = false;

        for (const mnemonic of allMnemonic) {
          const hasMnemonic = new RegExp(mnemonic.split(" ").slice(0, 3).join(" "), "gmi").test(inputValue);

          if (hasMnemonic) {
            response[inputType as PhishingInputType].hasMnemonic = true;
          }
        }
      }

      const allAccountInfo = manager.getAllAccountInfo();

      const privateKeys: string[] = [];

      for (const accountInfo of allAccountInfo) {
        if (accountInfo.type === "mnemonic") {
          for (const chainType of Object.keys(accountInfo.addresses)) {
            privateKeys.push(manager.getPrivateKey(accountInfo.uuid, chainType as ChainType));
          }
        } else {
          privateKeys.push(manager.getPrivateKey(accountInfo.uuid, accountInfo.chainType));
        }
      }

      for (const [inputType, inputValue] of Object.entries(data)) {
        response[inputType as PhishingInputType].hasPrivateKey = privateKeys.some(privateKey =>
          new RegExp(privateKey.slice(0, 10), "gmi").test(inputValue),
        );
      }
    }

    return response;
  });

  return { manager, provider };
}
