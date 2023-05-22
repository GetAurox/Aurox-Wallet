import { useEffect, useState } from "react";

import { GraphQLMarketsAPICoin, GraphQLMarketsAPICoinsResponse } from "ui/types";

import { AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL } from "common/config";
import { FavoriteAssets } from "common/storage";

import { useFetch } from "../utils";

const clearText = (value: string) => value.replace(/"/g, "");

export function useTokens(offset: number, search: string, limit = 100, favorites?: FavoriteAssets, chainIds?: string[]) {
  const [tokens, setTokens] = useState<GraphQLMarketsAPICoin[]>([]);

  const searchQuery = search.length > 0 ? `, textQuery: "${clearText(search)}"` : "";
  const favoritesQuery = favorites ? `, assetId: [${favorites}]` : "";

  // eslint-disable-next-line no-useless-escape, quotes, prettier/prettier
  const chainId = chainIds && chainIds.length > 0 ? `"${chainIds.join('","')}"` : null;

  const { response, loading, error } = useFetch<GraphQLMarketsAPICoinsResponse>(
    {
      method: "POST",
      baseURL: AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL,
      data: {
        query: `{
            market {
              coins(offset: ${offset}, limit: ${limit}, orderBy: market_cap${searchQuery} ${favoritesQuery} ${
          chainId ? `, chainId: [${chainId}]` : ""
        }) {
                id
                sn: shortName
                fn: fullName
                i: icons {
                  c: color(format: svg)
                }
                t: tags
                tokens${chainId ? ` (chainId: [${chainId}])` : ""} {
                  address
                  assetId
                  pairId
                  chainId
                }
                p: priceUSD
                c24: priceUSDChange24H
                c24p: priceChange24HPercent
                v24: volumeUSD24H
                ts: totalSupply
                cs: circulatingSupply
                mc: marketCapUSD
                r: rank
              }
            }
          }`,
      },
    },
    [offset, search, limit, chainId, favoritesQuery],
  );

  useEffect(() => {
    setTokens(coins => {
      const newCoins = response?.data?.data?.market?.coins || [];

      return offset > 0 && coins ? [...coins, ...newCoins] : newCoins;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response?.data?.data?.market?.coins]);

  const hasNextResults = response?.data?.data?.market?.coins?.length === limit;

  return { tokens, hasNextResults, loading, error };
}
