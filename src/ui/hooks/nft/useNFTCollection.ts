import { GraphQLMarketsNFTCollectionResponse } from "ui/types";
import { NFT_SERVICE_URL } from "common/config";

import { useFetch } from "../utils";

export function useNFTCollection(collectionSlug: string) {
  const { response, loading, error } = useFetch<GraphQLMarketsNFTCollectionResponse>(
    {
      method: "GET",
      baseURL: NFT_SERVICE_URL,
      url: `collection/${collectionSlug}`,
    },
    [collectionSlug],
  );

  const collection = response?.data.collection || null;

  return { collection, loading, error };
}
