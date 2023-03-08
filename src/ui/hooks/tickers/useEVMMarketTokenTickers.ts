import { useMemo } from "react";

import { ACCOUNT_TOKENS_MARKET_DATA_REFRESH_INTERVAL, evmNetworkGraphqlAPI } from "common/config";

import { useFetch } from "../utils";

import { TokenTickerData } from "./types";

const brandAddress = (address: string) => `__${address}`;
const removeAddressBranding = (brandedAddress: string) => String(brandedAddress).substring(2);

interface ResponseTokenPayload {
  id: string;
  priceUSD: string;
  priceChange24HPercent: string;
  priceUSDChange24H: string;
  volumeUSD24H: string;
  icons?: Partial<Record<"color" | "white" | "black", string | null>> | null;
  tokens?: { pairId?: number; assetId?: number }[];
}

interface ResponsePayload {
  data: { market: Record<string, ResponseTokenPayload> };
}
/**
 * Used to retrieve token blockchain tickers from the in-house indexer
 * @param tokenAddresses contract address of target tokens
 * @returns A mapping from contract address to ticker
 */
export function useEVMMarketTokenTickers(networkIdentifier: string, tokenAddresses: string[]) {
  // `tokenAddresses` order may vary and thus `query` changes so in order to avoid unnecessary re-renders sort is needed
  tokenAddresses.sort();

  let query = "";

  for (const address of tokenAddresses) {
    query += `
      ${brandAddress(address)}: coin(address: "${address}") {
      id
      priceUSD
      priceChange24HPercent
      priceUSDChange24H
      volumeUSD24H
      icons { color white black }
      tokens { pairId assetId }
    }`;
  }

  const { baseURL } = evmNetworkGraphqlAPI[networkIdentifier] || {};

  const { response, loading, error } = useFetch<ResponsePayload>(
    {
      shouldSkip: !baseURL || tokenAddresses.length === 0,
      refetchInterval: ACCOUNT_TOKENS_MARKET_DATA_REFRESH_INTERVAL,
      method: "POST",
      baseURL,
      data: {
        query: `{ market { ${query} } }`,
      },
    },
    [query],
  );

  const brandedTokenData = response?.data?.data?.market;

  const tickers = useMemo(() => {
    const result: Record<string, TokenTickerData> = {};

    for (const [brand, payload] of Object.entries(brandedTokenData ?? {})) {
      if (payload?.id) {
        // From BE we get tokens and some of that can be with pairId = 0, we take first with pairId > 0
        const firstTokenOfNonZeroPairId = payload.tokens?.filter(item => (item.pairId || 0) > 0)?.[0];

        result[removeAddressBranding(brand)] = {
          pairId: firstTokenOfNonZeroPairId?.pairId ?? null,
          assetId: firstTokenOfNonZeroPairId?.assetId ?? null,
          priceUSD: payload.priceUSD,
          priceChange24HPercent: payload.priceChange24HPercent,
          priceUSDChange24H: payload.priceUSDChange24H,
          volumeUSD24H: payload.volumeUSD24H,
          img: {
            alt: payload.id,
            src: payload.icons?.color ?? payload.icons?.white ?? payload.icons?.black ?? undefined,
          },
        };
      }
    }

    return result;
  }, [brandedTokenData]);

  return { tickers, loading, error };
}
