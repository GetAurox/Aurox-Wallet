import { useMemo } from "react";

import { useFetch } from "ui/hooks/utils";

import { GraphQLMarketsAPITokensResponse } from "ui/types";

import { AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL } from "common/config";

export function useMarketTokensByAssetId(assetId: number) {
  const { response, loading, error } = useFetch<GraphQLMarketsAPITokensResponse>(
    {
      refetchInterval: undefined,
      method: "POST",
      baseURL: AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL,
      data: {
        query: `{
            market {
              tokens(assetId: ${assetId}) {
                address
                chainId
                assetId
                pairId
              }
            }
          }`,
      },
    },
    [assetId],
  );

  const tokens = useMemo(() => (response?.data?.data?.market?.tokens || []).filter(token => token.assetId > 0), [response]);

  return { loading, error, tokens };
}
