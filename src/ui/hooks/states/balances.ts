import { useCallback, useMemo } from "react";
import isEqual from "lodash/isEqual";

import { MultichainAccountBalanceInfo, MultichainBalances, BlockchainNetwork, ImportedAsset, ImportedAssetToken } from "common/types";
import { PublicBalancesState } from "common/states";
import { DEFAULT_DECIMALS } from "common/config";
import {
  createAssetKey,
  getAssetDefinitionFromIdentifier,
  getAssetIdentifierFromDefinition,
  getNetworkDefinitionFromIdentifier,
  extractAssetKeyDetails,
  isNativeAsset,
} from "common/utils";

import { FlatTokenBalanceInfo } from "ui/types";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

import { NetworkGetter, useNetworkGetter } from "./network";
import { useImportedAssets } from "./importedAsset";
import { useAccountsVisibleOrdered, useActiveAccountUUID } from "./wallet";

type ImportedAssetGetter = (networkIdentifier: string, assetIdentifier: string) => ImportedAsset | null;

const EMPTY_FLAT_BALANCES = Object.freeze([]) as unknown as FlatTokenBalanceInfo[];

export const useBalancesState = makeStateConsumerHook(PublicBalancesState.buildConsumer());

export const useBalancesStateAssertReady = makeConsumerReadyAsserterHook(useBalancesState);

export function useAccountBalances(accountUUID: string | null | undefined) {
  const networkGetter = useNetworkGetter();

  const selector = useCallback(
    (data: MultichainBalances) => multichainAccountNetworksSelector(networkGetter, data, accountUUID),
    [accountUUID, networkGetter],
  );

  return useBalancesState(selector);
}

export function useActiveAccountBalances() {
  const activeAccountUUID = useActiveAccountUUID();
  const networkGetter = useNetworkGetter();

  const selector = useCallback(
    (data: MultichainBalances) => multichainAccountNetworksSelector(networkGetter, data, activeAccountUUID),
    [activeAccountUUID, networkGetter],
  );

  return useBalancesState(selector);
}

export function useAccountFlatTokenBalances(accountUUID: string | null | undefined): FlatTokenBalanceInfo[] {
  const networkGetter = useNetworkGetter();
  const assetGetter = useImportedAssetGetter();

  const selector = useCallback(
    (data: MultichainBalances) => flatAccountTokenBalancesSelector(data, networkGetter, assetGetter, accountUUID),
    [networkGetter, assetGetter, accountUUID],
  );

  return useBalancesState(selector) ?? EMPTY_FLAT_BALANCES;
}

export function useWalletPortfolioUSDValue(showHidden?: boolean): string | null {
  const visibleAccounts = useAccountsVisibleOrdered(showHidden);

  const visibleAccontUUIDs = useMemo(() => visibleAccounts?.map(account => account.uuid), [visibleAccounts]);

  const selector = useCallback(
    (data: MultichainBalances) =>
      walletPortfolioUSDValueSelector(
        Object.fromEntries(Object.entries(data).filter(([accountUUID]) => visibleAccontUUIDs?.includes(accountUUID))),
      ),
    [visibleAccontUUIDs],
  );

  return useBalancesState(selector);
}

export function useAccountPortfolioUSDValueGetter() {
  const networkGetter = useNetworkGetter();

  const selector = useCallback(
    (data: MultichainBalances) => {
      const mapping: Record<string, string> = {};

      for (const { accountUUID } of Object.values(data)) {
        const usdValue = accountPortfolioUSDValueSelector(data, networkGetter, accountUUID);

        if (Number(usdValue) > 0) {
          mapping[accountUUID] = usdValue;
        }
      }

      return mapping;
    },
    [networkGetter],
  );

  const usdValueMapping = useBalancesState(selector, isEqual);

  return useCallback(
    (accountUUID: string | null | undefined) => (accountUUID && usdValueMapping?.[accountUUID]) || null,
    [usdValueMapping],
  );
}

export function useAccountPortfolioUSDValue(accountUUID: string | null | undefined): string | null {
  const networkGetter = useNetworkGetter();

  const selector = useCallback(
    (data: MultichainBalances) => accountPortfolioUSDValueSelector(data, networkGetter, accountUUID),
    [networkGetter, accountUUID],
  );

  return useBalancesState(selector);
}

export function useActiveAccountPortfolioUSDValue(): string | null {
  const activeAccountUUID = useActiveAccountUUID();

  const networkGetter = useNetworkGetter();

  const selector = useCallback(
    (data: MultichainBalances) => accountPortfolioUSDValueSelector(data, networkGetter, activeAccountUUID),
    [networkGetter, activeAccountUUID],
  );

  return useBalancesState(selector);
}

export function useActiveAccountFlatTokenBalances(): FlatTokenBalanceInfo[] {
  const networkGetter = useNetworkGetter();
  const assetGetter = useImportedAssetGetter();

  const activeAccountUUID = useActiveAccountUUID();

  const selector = useCallback(
    (data: MultichainBalances) => flatAccountTokenBalancesSelector(data, networkGetter, assetGetter, activeAccountUUID),
    [networkGetter, assetGetter, activeAccountUUID],
  );

  return useBalancesState(selector) ?? EMPTY_FLAT_BALANCES;
}

export function useFlatTokenBalances(): FlatTokenBalanceInfo[] {
  const networkGetter = useNetworkGetter();
  const assetGetter = useImportedAssetGetter();

  const selector = useCallback(
    (data: MultichainBalances) => {
      const result: FlatTokenBalanceInfo[] = [];

      for (const balances of Object.values(data)) {
        const accountTokens = flatAccountTokenBalancesSelector(data, networkGetter, assetGetter, balances.accountUUID);
        result.push(...accountTokens);
      }

      return result;
    },
    [networkGetter, assetGetter],
  );

  return useBalancesState(selector) ?? EMPTY_FLAT_BALANCES;
}

export function useActiveAccountFlatTokenBalancesOfNetwork(networkIdentifier: string | null | undefined): FlatTokenBalanceInfo[] {
  const networkGetter = useNetworkGetter();
  const assetGetter = useImportedAssetGetter();

  const activeAccountUUID = useActiveAccountUUID();

  const selector = useCallback(
    (data: MultichainBalances) =>
      flatAccountTokenBalancesOfNetworkSelector(data, networkGetter, assetGetter, activeAccountUUID, networkIdentifier),
    [networkGetter, assetGetter, activeAccountUUID, networkIdentifier],
  );

  return useBalancesState(selector) ?? EMPTY_FLAT_BALANCES;
}

export function useActiveAccountBalanceOfNativeAsset(networkIdentifier: string | null | undefined) {
  const activeAccountUUID = useActiveAccountUUID();
  const networkGetter = useNetworkGetter();

  const selector = useCallback(
    (data: MultichainBalances) => {
      const balances = accountNetworkBalancesSelector(networkGetter, data, activeAccountUUID, networkIdentifier);

      const nativeAssetIdentifier = getAssetIdentifierFromDefinition({ type: "native" });

      return balances?.[nativeAssetIdentifier] ?? null;
    },
    [activeAccountUUID, networkGetter, networkIdentifier],
  );

  return useBalancesState(selector, isEqual);
}

export function useActiveAccountBalanceOfAsset(assetKey: string | null | undefined) {
  const activeAccountUUID = useActiveAccountUUID();
  const networkGetter = useNetworkGetter();

  const selector = useCallback(
    (data: MultichainBalances) => {
      if (!assetKey) return null;

      const { assetIdentifier, networkIdentifier } = extractAssetKeyDetails(assetKey);

      const balances = accountNetworkBalancesSelector(networkGetter, data, activeAccountUUID, networkIdentifier);

      return balances?.[assetIdentifier] ?? null;
    },
    [activeAccountUUID, assetKey, networkGetter],
  );

  return useBalancesState(selector, isEqual);
}

export function useActiveAccountFlatBalanceOfAsset(assetKey: string | null | undefined) {
  const networkGetter = useNetworkGetter();
  const assetGetter = useImportedAssetGetter();

  const activeAccountUUID = useActiveAccountUUID();

  const selector = useCallback(
    (data: MultichainBalances) => {
      if (!assetKey) return null;

      const { assetIdentifier, networkIdentifier } = extractAssetKeyDetails(assetKey);

      return flatAccountTokenBalanceOfAssetSelector(
        data,
        networkGetter,
        assetGetter,
        activeAccountUUID,
        networkIdentifier,
        assetIdentifier,
      );
    },
    [activeAccountUUID, assetGetter, assetKey, networkGetter],
  );

  return useBalancesState(selector, isEqual);
}

function useImportedAssetGetter() {
  const importedAssets = useImportedAssets();

  const importedAssetMap = useMemo(() => new Map(importedAssets?.map(asset => [asset.key, asset])), [importedAssets]);

  return useCallback(
    (networkIdentifier: string, assetIdentifier: string) => {
      const key = createAssetKey(networkIdentifier, assetIdentifier);

      return importedAssetMap.get(key) ?? null;
    },
    [importedAssetMap],
  );
}

function flatAccountTokenBalancesSelector(
  data: MultichainBalances,
  networkGetter: NetworkGetter,
  assetGetter: ImportedAssetGetter,
  accountUUID: string | null | undefined,
) {
  const networks = multichainAccountNetworksSelector(networkGetter, data, accountUUID);

  if (!networks) return [];

  const result = [];

  for (const { networkIdentifier, balances } of Object.values(networks)) {
    for (const balanceInfo of Object.values(balances ?? {})) {
      if (Number(balanceInfo.balance) <= 0) continue;

      if (isNativeAsset(balanceInfo.assetIdentifier)) {
        const network = networkGetter(networkIdentifier);

        if (network) {
          result.push(createFlatBalanceItemFromNativeAsset(networkIdentifier, balanceInfo, network));
        }

        continue;
      }

      const importedAsset = assetGetter(networkIdentifier, balanceInfo.assetIdentifier);

      if (importedAsset?.type === "token") {
        result.push(createFlatBalanceItemFromImportedTokenAsset(networkIdentifier, balanceInfo, importedAsset));
      }
    }
  }

  return result;
}

function walletPortfolioUSDValueSelector(data: MultichainBalances) {
  let sum = 0;

  for (const { networks } of Object.values(data ?? {})) {
    for (const { totalPortfolioValueUSD } of Object.values(networks ?? {})) {
      const numUSDValue = totalPortfolioValueUSD && Number(totalPortfolioValueUSD);

      if (typeof numUSDValue === "number" && Number.isFinite(numUSDValue) && numUSDValue > 0) {
        sum += numUSDValue;
      }
    }
  }

  return sum.toFixed(2);
}

function accountPortfolioUSDValueSelector(data: MultichainBalances, networkGetter: NetworkGetter, accountUUID: string | null | undefined) {
  const networks = multichainAccountNetworksSelector(networkGetter, data, accountUUID);

  if (!networks) return "0";

  let sum = 0;

  for (const { totalPortfolioValueUSD } of Object.values(networks)) {
    const numUSDValue = totalPortfolioValueUSD && Number(totalPortfolioValueUSD);

    if (typeof numUSDValue === "number" && Number.isFinite(numUSDValue) && numUSDValue > 0) {
      sum += numUSDValue;
    }
  }

  return sum.toFixed(2);
}

function flatAccountTokenBalancesOfNetworkSelector(
  data: MultichainBalances,
  networkGetter: NetworkGetter,
  assetGetter: ImportedAssetGetter,
  accountUUID: string | null | undefined,
  networkIdentifier: string | null | undefined,
) {
  if (!networkIdentifier) return [];

  const balances = accountNetworkBalancesSelector(networkGetter, data, accountUUID, networkIdentifier);

  if (!balances) return [];

  const result = [];

  for (const balanceInfo of Object.values(balances)) {
    if (Number(balanceInfo.balance) <= 0) continue;

    if (isNativeAsset(balanceInfo.assetIdentifier)) {
      const network = networkGetter(networkIdentifier);

      if (network) {
        result.push(createFlatBalanceItemFromNativeAsset(networkIdentifier, balanceInfo, network));
      }

      continue;
    }

    const importedAsset = assetGetter(networkIdentifier, balanceInfo.assetIdentifier);

    if (importedAsset?.type === "token") {
      result.push(createFlatBalanceItemFromImportedTokenAsset(networkIdentifier, balanceInfo, importedAsset));
    }
  }

  return result;
}

function flatAccountTokenBalanceOfAssetSelector(
  data: MultichainBalances,
  networkGetter: NetworkGetter,
  assetGetter: ImportedAssetGetter,
  accountUUID: string | null | undefined,
  networkIdentifier: string | null | undefined,
  assetIdentifier: string | null | undefined,
) {
  if (!networkIdentifier || !assetIdentifier) return null;

  const balances = accountNetworkBalancesSelector(networkGetter, data, accountUUID, networkIdentifier);

  if (!balances) return null;

  const balanceInfo = balances[assetIdentifier];

  if (!balanceInfo) return null;

  if (Number(balanceInfo.balance) <= 0) return null;

  if (isNativeAsset(balanceInfo.assetIdentifier)) {
    const network = networkGetter(networkIdentifier);

    if (network) {
      return createFlatBalanceItemFromNativeAsset(networkIdentifier, balanceInfo, network);
    }
  }

  const importedAsset = assetGetter(networkIdentifier, balanceInfo.assetIdentifier);

  if (importedAsset?.type === "token") {
    return createFlatBalanceItemFromImportedTokenAsset(networkIdentifier, balanceInfo, importedAsset);
  }

  return null;
}

function accountNetworkBalancesSelector(
  networkGetter: NetworkGetter,
  data: MultichainBalances,
  accountUUID: string | null | undefined,
  networkIdentifier: string | null | undefined,
) {
  if (!networkIdentifier) return null;

  const networks = multichainAccountNetworksSelector(networkGetter, data, accountUUID);

  return networks?.[networkIdentifier]?.balances ?? null;
}

function multichainAccountNetworksSelector(networkGetter: NetworkGetter, data: MultichainBalances, accountUUID: string | null | undefined) {
  if (!accountUUID || data[accountUUID] == null) {
    return null;
  }

  const networks = Object.fromEntries(
    Object.entries(data[accountUUID].networks).filter(([networkIdentifier]) => !networkGetter(networkIdentifier)?.disabled),
  );

  return networks;
}

function createFlatBalanceItemFromNativeAsset(
  networkIdentifier: string,
  balanceInfo: MultichainAccountBalanceInfo,
  network: BlockchainNetwork,
): FlatTokenBalanceInfo {
  const { assetIdentifier, balance, balanceUSDValue } = balanceInfo;

  // TODO: must include currencyName and currencyDecimals
  const { currencySymbol } = network;

  return {
    key: createAssetKey(networkIdentifier, assetIdentifier),
    ...getAssetDefinitionFromIdentifier(assetIdentifier),
    ...getNetworkDefinitionFromIdentifier(networkIdentifier),
    name: currencySymbol,
    symbol: currencySymbol,
    decimals: DEFAULT_DECIMALS,
    assetIdentifier,
    // native asset is always verified and should always be shown
    verified: true,
    visibility: "force-show",
    autoImported: true,
    networkIdentifier,
    balance,
    balanceUSDValue,
  };
}

function createFlatBalanceItemFromImportedTokenAsset(
  networkIdentifier: string,
  balanceInfo: MultichainAccountBalanceInfo,
  importedAssetToken: ImportedAssetToken,
): FlatTokenBalanceInfo {
  const { assetIdentifier, balance, balanceUSDValue } = balanceInfo;

  const { name, symbol, decimals, verified, visibility, autoImported } = importedAssetToken;

  return {
    key: importedAssetToken.key,
    ...getAssetDefinitionFromIdentifier(assetIdentifier),
    ...getNetworkDefinitionFromIdentifier(networkIdentifier),
    name,
    symbol,
    decimals,
    verified,
    visibility,
    autoImported,
    assetIdentifier,
    networkIdentifier,
    balance,
    balanceUSDValue,
  };
}
