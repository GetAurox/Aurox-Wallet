import compact from "lodash/compact";

import { ACCOUNT_TOKENS_REFRESH_INTERVAL, GRAPHQL_LEECHER_X_API_KEY, AUROX_BLOCKCHAIN_ETHEREUM_GRAPHQL_BASE_URL } from "common/config";
import { EthereumAccountNFT, GraphQLEthereumAccountNFTsBalanceResponse } from "ui/types";

import { useFetch } from "../utils";

export interface AccountPayload {
  balance: {
    nftTokens: EthereumAccountNFT[];
  };
}

interface AccountBalancePayload {
  error?: string;
  loading: boolean;
  balances: Record<string, AccountPayload>;
}

const brandAddress = (address: string) => `__${address}`;
const removeAddressBranding = (brandedAddress: string) => String(brandedAddress).substring(2);

export function useAccountNFTsBalance(accounts?: (string | null | undefined)[]): AccountBalancePayload {
  // `accounts` order may vary and thus `query` changes so in order to avoid unnecessary re-renders sort is needed
  accounts?.sort();

  let query = "";

  for (const address of compact(accounts ?? [])) {
    query += `
      ${brandAddress(address)}: account(accountAddress: "${address}") {
        balance {
          nftTokens {
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
      refetchInterval: ACCOUNT_TOKENS_REFRESH_INTERVAL,
      shouldSkip: !accounts || accounts.length === 0,
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
    [query],
  );

  const brandedBalances = response?.data?.data?.ethereum ?? {};

  const balances: Record<string, AccountPayload> = {};

  for (const [brand, payload] of Object.entries<AccountPayload>(brandedBalances)) {
    balances[removeAddressBranding(brand)] = payload;
  }

  return { balances, loading, error };
}
