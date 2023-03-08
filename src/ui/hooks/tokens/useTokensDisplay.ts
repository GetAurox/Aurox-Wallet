import { useMemo } from "react";

import partition from "lodash/partition";

import { getAssetDefinitionFromIdentifier, getNetworkDefinitionFromIdentifier } from "common/utils";
import { NativeAssetDefinition, ContractAssetDefinition } from "common/types";
import { networkNativeCurrencyData } from "common/config";

import { FlatTokenBalanceInfo, TokenDisplay } from "ui/types";

import { useTokenIcons } from "./useTokenIcons";

type Native = FlatTokenBalanceInfo & NativeAssetDefinition;
type Contract = FlatTokenBalanceInfo & ContractAssetDefinition;

/**
 * Creates a new list of tokens with the display information.
 * @param tokens array of token balance info
 * @returns Corresponding array adhering to the original order of tokens received from the input with the extra info if available
 */
export function useTokensDisplay(tokens: FlatTokenBalanceInfo[]): TokenDisplay[] {
  const [nativeAssets, contractAssets] = useMemo(
    () => partition(tokens, token => token.type === "native") as [Native[], Contract[]],
    [tokens],
  );

  const { icons: contractIcons } = useTokenIcons(contractAssets.map(token => token.contractAddress));

  return useMemo(() => {
    const nativeAssetDisplays = nativeAssets.map<TokenDisplay>(asset => {
      const nativeCurrencyData = networkNativeCurrencyData[asset.networkIdentifier];

      const assetDefinition = getAssetDefinitionFromIdentifier(asset.assetIdentifier);
      const networkDefinition = getNetworkDefinitionFromIdentifier(asset.networkIdentifier);

      return {
        key: asset.key,
        assetIdentifier: asset.assetIdentifier,
        networkIdentifier: asset.networkIdentifier,
        assetDefinition,
        networkDefinition,
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        balance: asset.balance,
        balanceUSDValue: asset.balanceUSDValue,
        visibility: asset.visibility,
        verified: asset.verified,
        autoImported: asset.autoImported,
        img: {
          alt: nativeCurrencyData?.symbol,
          src: nativeCurrencyData?.icons?.color ?? nativeCurrencyData?.icons?.white ?? nativeCurrencyData?.icons?.black,
        },
      };
    });

    const contractAssetDisplays = contractAssets.map<TokenDisplay>(asset => {
      const iconData = contractIcons[asset.contractAddress];

      const assetDefinition = getAssetDefinitionFromIdentifier(asset.assetIdentifier);
      const networkDefinition = getNetworkDefinitionFromIdentifier(asset.networkIdentifier);

      return {
        key: asset.key,
        assetIdentifier: asset.assetIdentifier,
        networkIdentifier: asset.networkIdentifier,
        assetDefinition,
        networkDefinition,
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        balance: asset.balance,
        balanceUSDValue: asset.balanceUSDValue,
        visibility: asset.visibility,
        verified: asset.verified,
        autoImported: asset.autoImported,
        img: iconData?.img ?? { alt: asset.symbol ?? asset.name },
      };
    });

    return [...nativeAssetDisplays, ...contractAssetDisplays];
  }, [nativeAssets, contractAssets, contractIcons]);
}
