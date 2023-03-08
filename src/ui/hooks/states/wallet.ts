import { useCallback } from "react";
import findKey from "lodash/findKey";

import { ChainType, AccountInfoType, AccountInfoFromType, AccountInfo, MnemonicAccountInfo } from "common/types";
import { consolidateAccountsInfo } from "common/utils";
import { SecureWalletState } from "common/states";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

export const useWalletState = makeStateConsumerHook(SecureWalletState.buildConsumer());

export const useWalletStateAssertReady = makeConsumerReadyAsserterHook(useWalletState);

export function useIsWalletSetup() {
  return useWalletState(isWalletSetupSelector);
}

export function useIsWalletUnlocked() {
  return useWalletState(isWalletUnlockedSelector);
}

export function useActiveAccountUUID() {
  return useWalletState(activeAccountUUIDSelector);
}

export function useAccounts() {
  return useWalletState(accountsSelector);
}

export function useWalletSetupMethod() {
  return useWalletState(walletSetupMethodSelector);
}

export function useAccountsOfType<T extends AccountInfoType>(type: T) {
  const accountsOfTypeSelector = useCallback(
    (data: SecureWalletState.Data) => {
      if (!data || !data.accounts) {
        return null;
      }

      const result: Record<string, AccountInfoFromType<T>> = {};

      for (const account of Object.values(data.accounts)) {
        if (account.type === type) {
          result[account.uuid] = account as AccountInfoFromType<T>;
        }
      }

      return result;
    },
    [type],
  );

  return useWalletState(accountsOfTypeSelector);
}

export function useRootMnemonicAccountData() {
  const rootMnemonicAccount = useWalletState(rootMnemonicAccountSelector);

  if (rootMnemonicAccount) {
    return { address: rootMnemonicAccount.addresses.evm, uuid: rootMnemonicAccount.uuid };
  }

  return null;
}

export function useAccountsVisibleOrdered(showHidden = false) {
  const accountsOrderedVisibleSelector = useCallback(
    (data: SecureWalletState.Data) => accountsOrderedSelector(data, showHidden),
    [showHidden],
  );

  return useWalletState(accountsOrderedVisibleSelector);
}

export function useActiveAccount(): AccountInfo | null {
  return useWalletState(activeAccountSelector);
}

export function useAccountByUUID(uuid: string | null) {
  const selector = useCallback((data: SecureWalletState.Data) => (!uuid ? null : data?.accounts?.[uuid] ?? null), [uuid]);

  return useWalletState(selector);
}

export function useConsolidatedAccountsInfo(chainType: ChainType, listing: "visible" | "hidden" = "visible") {
  const selector = useCallback(
    (data: SecureWalletState.Data) => {
      const allWallets = [...consolidateAccountsInfo(Object.values(data?.accounts ?? {}), chainType)];
      const showHidden = listing === "hidden";

      return allWallets.filter(wallet => (wallet.hidden ?? false) === showHidden);
    },
    [chainType, listing],
  );

  return useWalletState(selector);
}

const isWalletSetupSelector = (data: SecureWalletState.Data) => data?.isWalletSetup ?? null;
const isWalletUnlockedSelector = (data: SecureWalletState.Data) => data?.isWalletUnlocked ?? null;
const activeAccountUUIDSelector = (data: SecureWalletState.Data) => data?.activeAccountUUID ?? null;
const accountsSelector = (data: SecureWalletState.Data) => data?.accounts ?? null;
const walletSetupMethodSelector = (data: SecureWalletState.Data) => data?.setupMethod ?? null;

const accountsOrderedSelector = (data: SecureWalletState.Data, showHidden: boolean) => {
  if (!data || !data.accounts || !data.accountUUIDs) {
    return null;
  }

  return data.accountUUIDs
    .filter(uuid => data.accounts[uuid] && ((!showHidden && (data.accounts[uuid].hidden ?? false) === showHidden) || showHidden))
    .map(uuid => data.accounts[uuid]);
};

const activeAccountSelector = (data: SecureWalletState.Data): AccountInfo | null => {
  if (!data || !data.activeAccountUUID) {
    return null;
  }

  return data.accounts?.[data.activeAccountUUID] ?? null;
};

const rootMnemonicAccountSelector = (data: SecureWalletState.Data): MnemonicAccountInfo | null => {
  if (!data || !data.accounts) {
    return null;
  }

  const rootAccountUUID = findKey(data.accounts, account => account.type === "mnemonic" && account.accountNumber === 0) ?? null;

  if (rootAccountUUID && data.accounts[rootAccountUUID]) {
    return data.accounts[rootAccountUUID] as MnemonicAccountInfo;
  }

  return null;
};
