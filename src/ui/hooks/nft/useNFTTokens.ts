import { GraphQLMarketsNFTTokensResponse } from "ui/types";
import { NFT_SERVICE_URL } from "common/config";

import { useFetch } from "../utils";

export function useNFTTokens(collection: string, offset: number, limit = 100) {
  const { response, loading, error } = useFetch<GraphQLMarketsNFTTokensResponse>(
    {
      method: "GET",
      baseURL: NFT_SERVICE_URL,
      url: `asset?collection_slug=${collection}`,
    },
    [collection, offset, limit],
  );

  const NFTTokens = response?.data.asset || [];
  const hasNextResults = response?.data.asset.length === limit;

  return { NFTTokens, hasNextResults, loading, error };
}
