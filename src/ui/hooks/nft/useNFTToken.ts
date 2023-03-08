import compact from "lodash/compact";

import { EthereumAccountNFT, GraphQLEthereumAccountNFTsBalanceResponse } from "ui/types";
import { AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL, GRAPHQL_LEECHER_X_API_KEY } from "common/config";

import { useFetch } from "../utils";
import { AccountPayload } from "../accounts/useAccountNFTsBalance";

const brandAddress = (address: string) => `__${address}`;
const removeAddressBranding = (brandedAddress: string) => String(brandedAddress).substring(2);

export function useNFTToken(accounts: (string | null | undefined)[], tokenAddress: string, tokenId: string) {
  let query = "";

  for (const address of compact(accounts ?? [])) {
    query += `
      ${brandAddress(address)}: account(accountAddress: "${address}") {
        balance {
          nftTokens(tokenId: "${tokenId}", tokenAddress: "${tokenAddress}") {
            tokenAddress
            tokenContractType
            tokenId
            token {
              name
              symbol
              address
              decimals
              contractType
              contractReadLog
              readBlockNumber
            }
            metadata {
              id
              name
              collectionName
              description
              imageUrl
              traits {
                value
                type
                count
                traitPercentage
                displayType
              }
            }
          }
        }
      }
    `;
  }

  const { response, loading, error } = useFetch<GraphQLEthereumAccountNFTsBalanceResponse>(
    {
      method: "POST",
      baseURL: AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL,
      data: {
        query: `
        {
          ethereum(maxDecimals: 4) {
            ${query}
          }
        }`,
      },
      headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY },
    },
    [tokenAddress, tokenId],
  );

  const brandedBalances = response?.data?.data.ethereum ?? {};

  const nft: Record<string, EthereumAccountNFT> = {};

  for (const [brand, payload] of Object.entries<AccountPayload>(brandedBalances)) {
    nft[removeAddressBranding(brand)] = payload.balance.nftTokens[0];
  }

  return { nft, loading, error };
}
