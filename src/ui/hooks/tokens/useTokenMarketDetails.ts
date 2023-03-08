import { useMemo } from "react";

import { extractAssetKeyDetails, getAssetDefinitionFromIdentifier } from "common/utils";
import { evmNetworkGraphqlAPI } from "common/config";

import { TokenMarketDetails, TokenMarketDetailsSocial } from "ui/types";

import { useFetch } from "../utils";

interface ResponsePayload {
  data: {
    market: {
      coin: {
        tags?: string[];
        totalSupply?: string;
        circulatingSupply?: string;
        marketCapUSD?: string;
        rank?: number;
        description?: string;
        links?: string[];
        socials?: Partial<TokenMarketDetailsSocial>[];
      };
    };
  };
}

export function useTokenMarketDetails(assetKey: string | undefined | null) {
  const { assetIdentifier = null, networkIdentifier = null } = assetKey ? extractAssetKeyDetails(assetKey) : {};

  const assetDefinition = assetIdentifier ? getAssetDefinitionFromIdentifier(assetIdentifier) : null;

  const { baseURL, nativeWrapper } = (networkIdentifier && evmNetworkGraphqlAPI[networkIdentifier]) || {};

  const address = !assetDefinition ? null : assetDefinition.type === "contract" ? assetDefinition.contractAddress : nativeWrapper;

  const { response, loading, error } = useFetch<ResponsePayload>(
    {
      method: "POST",
      baseURL: baseURL ?? "",
      shouldSkip: !baseURL || !address,
      data: {
        query: `{
          market {
            coin(address: "${address}") {
              tags
              totalSupply
              circulatingSupply
              marketCapUSD
              rank
              description
              links
              socials { network username url }
            }
          }
        }`,
      },
    },
    [address],
  );

  const tokenDetails = useMemo<TokenMarketDetails | null>(() => {
    const payload = response?.data?.data?.market?.coin;

    if (!payload) return null;

    const socials = payload.socials?.map(social => (social?.network && social.url ? social : null)) ?? [];

    return {
      tags: payload.tags ?? [],
      totalSupply: payload.totalSupply ?? "0",
      circulatingSupply: payload.circulatingSupply ?? "0",
      marketCapUSD: payload.marketCapUSD ?? "0",
      rank: payload.rank ?? 0,
      description: payload.description ?? "0",
      links: payload.links ?? [],
      socials: socials as TokenMarketDetailsSocial[],
    };
  }, [response]);

  return { tokenDetails, loading, error };
}
