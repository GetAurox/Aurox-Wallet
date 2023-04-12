import { useMemo } from "react";

import compact from "lodash/compact";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";

import { getAssetDefinitionFromIdentifier, getNetworkDefinitionFromIdentifier } from "common/utils";
import { useTickers } from "ui/common/connections";
import {
  BINANCE_SMART_CHAIN_NATIVE_ASSET_PRICING_PAIR_ID,
  ethereumMainnetNetworkIdentifier,
  binanceSmartChainNetworkIdentifier,
  polygonNetworkIdentifier,
  avalancheNetworkIdentifier,
  networkNativeCurrencyData,
} from "common/config";

import { FlatTokenBalanceInfo, TokenDisplayWithTicker } from "ui/types";

import { useEVMMarketTokenTickers } from "./useEVMMarketTokenTickers";
import { useEVMNativeAssetTickers } from "./useEVMNativeAssetTickers";
import { TokenTickerData } from "./types";

/**
 * Creates a new list of tokens with the display and ticker information.
 * @param tokens array of token balance info
 * @returns Corresponding array adhering to the original order of tokens received from the input with the extra info if available
 */
export function useTokensDisplayWithTickers(tokens: FlatTokenBalanceInfo[]): TokenDisplayWithTicker[] {
  const [networkTokenContractAddresses, nativeTokenNetworkIdentifiers] = useMemo(() => {
    const networkTokenContractAddresses: Record<string, string[]> = {
      [ethereumMainnetNetworkIdentifier]: [],
      [binanceSmartChainNetworkIdentifier]: [],
      [polygonNetworkIdentifier]: [],
      [avalancheNetworkIdentifier]: [],
    };

    const nativeTokenNetworkIdentifiers = [];

    for (const token of tokens) {
      if (token.type === "contract") {
        networkTokenContractAddresses[token.networkIdentifier]?.push(token.contractAddress);
      } else if (token.type === "native") {
        nativeTokenNetworkIdentifiers.push(token.networkIdentifier);
      }
    }

    return [networkTokenContractAddresses, nativeTokenNetworkIdentifiers];
  }, [tokens]);

  // TODO: replace with unified API once available
  const { tickers: ethereumMainnetTokenTickers } = useEVMMarketTokenTickers(
    ethereumMainnetNetworkIdentifier,
    networkTokenContractAddresses[ethereumMainnetNetworkIdentifier],
  );
  const { tickers: bscTokenTickers } = useEVMMarketTokenTickers(
    binanceSmartChainNetworkIdentifier,
    networkTokenContractAddresses[binanceSmartChainNetworkIdentifier],
  );
  const { tickers: polygonTokenTickers } = useEVMMarketTokenTickers(
    polygonNetworkIdentifier,
    networkTokenContractAddresses[polygonNetworkIdentifier],
  );
  const { tickers: avalancheTokenTickers } = useEVMMarketTokenTickers(
    avalancheNetworkIdentifier,
    networkTokenContractAddresses[avalancheNetworkIdentifier],
  );

  const nativeTickers = useEVMNativeAssetTickers(nativeTokenNetworkIdentifiers);

  const nativeTokenPairIdDependencies = sortBy(uniq(compact(Object.values(nativeTickers).map(ticker => ticker.pairId))));

  const nativeMarketTickers = useTickers(nativeTokenPairIdDependencies, { throttleMaxWait: 10000 });

  return useMemo(() => {
    const result: TokenDisplayWithTicker[] = [];

    for (const token of tokens) {
      let ticker: TokenTickerData | null = null;

      if (token.type === "native") {
        ticker = nativeTickers[token.networkIdentifier] ?? null;
      } else if (token.networkIdentifier === ethereumMainnetNetworkIdentifier) {
        ticker = ethereumMainnetTokenTickers[token.contractAddress] ?? null;
      } else if (token.networkIdentifier === binanceSmartChainNetworkIdentifier) {
        ticker = bscTokenTickers[token.contractAddress] ?? null;
      } else if (token.networkIdentifier === polygonNetworkIdentifier) {
        ticker = polygonTokenTickers[token.contractAddress] ?? null;
      } else if (token.networkIdentifier === avalancheNetworkIdentifier) {
        ticker = avalancheTokenTickers[token.contractAddress] ?? null;
      }

      const marketTicker = typeof ticker?.pairId !== "number" ? null : nativeMarketTickers[ticker.pairId] ?? null;

      let img = ticker?.img;
      let pairId = ticker?.pairId;

      if (token.networkIdentifier === binanceSmartChainNetworkIdentifier && token.type === "native") {
        const nativeCurrencyData = networkNativeCurrencyData[binanceSmartChainNetworkIdentifier];

        img = { alt: nativeCurrencyData?.symbol, src: nativeCurrencyData?.icons?.color };

        pairId = BINANCE_SMART_CHAIN_NATIVE_ASSET_PRICING_PAIR_ID;
      }

      if (token.type === "nft" && token?.metadata?.image) {
        img = { alt: token.name, src: token?.metadata?.image };
      }

      const assetDefinition = getAssetDefinitionFromIdentifier(token.assetIdentifier);
      const networkDefinition = getNetworkDefinitionFromIdentifier(token.networkIdentifier);

      const priceUSD = marketTicker?.price?.toString() ?? ticker?.priceUSD ?? null;

      const balanceUSDValueFromTicker = priceUSD ? Number(priceUSD) * Number(token.balance) : null;

      const truncatedBalanceUSDValueFromTicker = balanceUSDValueFromTicker ? Number(balanceUSDValueFromTicker.toFixed(2)).toString() : null;

      result.push({
        key: token.key,
        networkIdentifier: token.networkIdentifier,
        assetIdentifier: token.assetIdentifier,
        assetDefinition,
        networkDefinition,
        balance: token.balance,
        balanceUSDValue: truncatedBalanceUSDValueFromTicker ?? token.balanceUSDValue,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        verified: token.verified,
        visibility: token.visibility,
        autoImported: token.autoImported,
        img: img ?? { alt: token.symbol ?? token.name },
        pairId: pairId ?? null,
        priceUSD: priceUSD,
        priceChange24HPercent: marketTicker?.change24HPercent?.toString() ?? ticker?.priceChange24HPercent ?? null,
        priceUSDChange24H: marketTicker?.change24H?.toString() ?? ticker?.priceUSDChange24H ?? null,
        volumeUSD24H: marketTicker?.volume24H?.toString() ?? ticker?.volumeUSD24H ?? null,
      });
    }

    return result;
  }, [
    tokens,
    nativeMarketTickers,
    nativeTickers,
    ethereumMainnetTokenTickers,
    bscTokenTickers,
    polygonTokenTickers,
    avalancheTokenTickers,
  ]);
}
