import { useEffect, useState, useRef } from "react";
import axios from "axios";
import isEqual from "lodash/isEqual";

import {
  networkNativeCurrencyData,
  evmNetworkGraphqlAPI,
  EVM_GRAPHQL_API_ROOT_ASSET_ALIAS,
  GRAPHQL_LEECHER_X_API_KEY,
} from "common/config";

import { TokenTickerData } from "./types";

interface ResponsePayload {
  data: {
    ethereum: {
      pricing: {
        priceNow: { value: string };
        price24HAgo: { value: string };
      };
    };
  };
}

const TICKER_QUERY_TIMEOUT = 5 * 1000;

const TICKER_REFRESH_TIME = 10 * 1000;

/**
 * Used to retrieve evm tickers from in-house indexers
 * @param targetNetworkIdentifiers List of networks to retrive tickers for, must be memoized
 */
export function useEVMNativeAssetTickers(targetNetworkIdentifiers: string[]): Record<string, TokenTickerData> {
  const [tickers, setTickers] = useState<Record<string, TokenTickerData>>({});

  // We keep a reference here to make sure when the targetNetworkIdentifiers array changes reference it also changes content
  // otherwise we'll unsubscribe/resubscribe needlessly
  const networkIdentifiersInEffectRef = useRef<string[]>([]);

  if (
    networkIdentifiersInEffectRef.current !== targetNetworkIdentifiers &&
    !isEqual(networkIdentifiersInEffectRef.current, targetNetworkIdentifiers)
  ) {
    networkIdentifiersInEffectRef.current = targetNetworkIdentifiers;
  }

  const effectiveNetworkIdentifiers = networkIdentifiersInEffectRef.current;

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    let timeout: any;

    const getAllTickers = async () => {
      const entryTasks = effectiveNetworkIdentifiers.map(networkIdentifier => getNativeTickerForTarget(networkIdentifier, signal));

      const results = await Promise.allSettled(entryTasks);

      if (signal.aborted) return;

      const newTickersState: Record<string, TokenTickerData> = {};

      for (const [index, result] of results.entries()) {
        if (result.status === "rejected") {
          console.error(`Failed to get native asset ticker for network: ${effectiveNetworkIdentifiers[index]}`);
        } else {
          const [networkIdentifier, ticker] = result.value;

          newTickersState[networkIdentifier] = ticker;
        }
      }

      setTickers(newTickersState);

      timeout = setTimeout(getAllTickers, TICKER_REFRESH_TIME);
    };

    getAllTickers();

    return () => {
      abortController.abort();

      clearTimeout(timeout);
    };
  }, [effectiveNetworkIdentifiers]);

  return tickers;
}

async function getNativeTickerForTarget(networkIdentifier: string, signal: AbortSignal): Promise<[string, TokenTickerData]> {
  let priceNow: number | null = null;
  let price24HAgo: number | null = null;

  if (evmNetworkGraphqlAPI[networkIdentifier]) {
    const { baseURL } = evmNetworkGraphqlAPI[networkIdentifier];

    const now = Math.floor(Date.now() / 1000);

    const h24Ago = Math.floor(Date.now() / 1000 - 24 * 60 * 60);

    const query = `{
    ethereum(maxDecimals: 8) {
      pricing {
        priceNow: tokenPrice(tokenAddress: "${EVM_GRAPHQL_API_ROOT_ASSET_ALIAS}" time:${now} ) {
          value: USD
        }
        price24HAgo: tokenPrice(tokenAddress: "${EVM_GRAPHQL_API_ROOT_ASSET_ALIAS}" time:${h24Ago} ) {
          value: USD
        }
      }
    }
  }`;

    const { data } = await axios.post<ResponsePayload>(
      baseURL,
      { query },
      { signal, timeout: TICKER_QUERY_TIMEOUT, headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY } },
    );

    const priceNowStr = data?.data?.ethereum?.pricing?.priceNow?.value ?? null;
    const price24HAgoStr = data?.data?.ethereum?.pricing?.price24HAgo?.value ?? null;

    priceNow = priceNowStr ? Number(priceNowStr) : null;
    price24HAgo = price24HAgoStr ? Number(price24HAgoStr) : null;
  }

  const priceDiff = priceNow !== null && price24HAgo !== null ? priceNow - price24HAgo : null;

  const changePercentage = priceDiff !== null && price24HAgo !== null ? (price24HAgo <= 0 ? 0 : (100 * priceDiff) / price24HAgo) : null;

  const nativeCurrencyData = networkNativeCurrencyData[networkIdentifier];

  const ticker: TokenTickerData = {
    assetId: nativeCurrencyData?.assetId ?? null,
    pairId: nativeCurrencyData?.pairId ?? null,
    priceUSD: typeof priceNow === "number" ? Number(priceNow.toFixed(8)).toString() : null,
    priceUSDChange24H: typeof priceDiff === "number" ? Number(priceDiff.toFixed(8)).toString() : null,
    priceChange24HPercent: typeof changePercentage === "number" ? Number(changePercentage.toFixed(2)).toString() : null,
    volumeUSD24H: "0",
    img: {
      alt: nativeCurrencyData?.symbol ?? nativeCurrencyData?.name,
      src: nativeCurrencyData?.icons?.color,
    },
  };

  return [networkIdentifier, ticker];
}
