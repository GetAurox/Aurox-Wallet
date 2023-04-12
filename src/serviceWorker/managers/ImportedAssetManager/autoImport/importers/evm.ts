import axios from "axios";

import { evmNetworkGraphqlAPI, GRAPHQL_LEECHER_X_API_KEY } from "common/config";
import { getAssetIdentifierFromDefinition } from "common/utils";

import { BlockchainNetwork, EVMSupportedNFTContractType } from "common/types";

import { AutoImportNFTAssetCandidate, AutoImportTokenAssetCandidate } from "../types";

interface ResponseEthereumPayload {
  [brandedAddress: string]: {
    balance: {
      tokens: {
        amount: string;
        token: {
          address: string;
          name: string;
          symbol: string;
          decimals: string;
          contractType: string;
          verified?: boolean;
        };
      }[];
    };
  };
}

interface ResponseEthereumNFTsPayload {
  [brandedAddress: string]: {
    balance: {
      nftTokens: {
        amount: string;
        tokenId: string;
        accountAddress: string;
        token: {
          address: string;
          decimals: number;
          name: string;
          symbol: string;
          contractType: EVMSupportedNFTContractType;
          verified?: boolean;
        };
        metadata?: {
          name: string;
          collectionName: string;
          imageUrl: string;
        };
      }[];
    };
  };
}

export async function autoImportTokenAssetsForEVMChain(networkIdentifier: string, accountAddresses: string[], signal: AbortSignal) {
  if (!evmNetworkGraphqlAPI[networkIdentifier]) {
    return [];
  }

  const addressTokensQueries = [];

  const { baseURL } = evmNetworkGraphqlAPI[networkIdentifier];

  for (const address of accountAddresses) {
    addressTokensQueries.push(`
      __${address}: account(accountAddress: "${address}") {
        balance {
          valueUSD
          tokens {
            amount
            token {
              address
              name
              symbol
              decimals
              contractType
              verified
            }
          }
        }
      }
    `);
  }

  const query = `{
    ethereum {
      ${addressTokensQueries.join("")}
    }
  }`;

  const response = await axios.post(
    baseURL,
    { query },
    {
      signal,
      headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY },
    },
  );

  if (signal.aborted) return [];

  const candidates = new Map<string, AutoImportTokenAssetCandidate>();

  const brandedTokenBalances: ResponseEthereumPayload = response?.data?.data?.ethereum ?? {};

  for (const accountBalancesPayload of Object.values(brandedTokenBalances)) {
    if (Array.isArray(accountBalancesPayload.balance.tokens)) {
      for (const tokenInfo of accountBalancesPayload.balance.tokens) {
        if (tokenInfo && tokenInfo.token && Number(tokenInfo.amount) > 0) {
          const { address, contractType, decimals, name, symbol, verified } = tokenInfo.token;

          const decimalsValue = Number(decimals);
          const decimalsValid = Number.isInteger(decimalsValue) && decimalsValue >= 0;

          if (contractType === "ERC20" && address && name && symbol && decimalsValid) {
            const contractAddress = String(address).toLowerCase();

            const assetIdentifier = getAssetIdentifierFromDefinition({
              type: "contract",
              contractType: "ERC20",
              contractAddress,
            });

            if (!candidates.has(assetIdentifier)) {
              candidates.set(assetIdentifier, {
                assetIdentifier,
                contractAddress,
                contractType: "ERC20",
                decimals: decimalsValue,
                name,
                symbol,
                verified: !!verified,
              });
            }
          }
        }
      }
    }
  }

  return [...candidates.values()];
}

export async function autoImportNFTAssetsForEVMChain(network: BlockchainNetwork, accountAddresses: string[], signal: AbortSignal) {
  const networkIdentifier = network.identifier;

  if (!evmNetworkGraphqlAPI[networkIdentifier]) {
    return [];
  }

  const addressTokensQueries = [];

  const { baseURL } = evmNetworkGraphqlAPI[networkIdentifier];

  for (const address of accountAddresses) {
    addressTokensQueries.push(`
      __${address}: account(accountAddress: "${address}") {
        balance {
          valueUSD
          nftTokens {
            amount
            tokenId
            accountAddress
            token {
              address
              name
              symbol
              decimals
              contractType
              verified
            }
            metadata {
              name
              collectionName
              imageUrl
            }
          }
        }
      }
    `);
  }

  const query = `{
    ethereum {
      ${addressTokensQueries.join("")}
    }
  }`;

  const response = await axios.post(
    baseURL,
    { query },
    {
      signal,
      headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY },
    },
  );

  if (signal.aborted) return [];

  const candidates = new Map<string, AutoImportNFTAssetCandidate>();

  const brandedTokenBalances: ResponseEthereumNFTsPayload = response?.data?.data?.ethereum ?? {};

  for (const accountBalancesPayload of Object.values(brandedTokenBalances)) {
    if (Array.isArray(accountBalancesPayload.balance.nftTokens)) {
      for (const tokenInfo of accountBalancesPayload.balance.nftTokens) {
        if (tokenInfo && tokenInfo.token && Number(tokenInfo.amount) > 0) {
          const { address, contractType, decimals, verified, name, symbol } = tokenInfo.token;
          const { tokenId, metadata, accountAddress } = tokenInfo;

          const decimalsValue = Number(decimals);
          const decimalsValid = Number.isInteger(decimalsValue) && decimalsValue >= 0;

          if (["ERC1155", "ERC721"].includes(contractType) && address && decimalsValid) {
            const contractAddress = String(address).toLowerCase();

            const assetIdentifier = getAssetIdentifierFromDefinition({
              type: "nft",
              contractType: contractType as EVMSupportedNFTContractType,
              contractAddress,
              tokenId,
            });

            if (!candidates.has(assetIdentifier)) {
              const NFTName = metadata?.name || name || "";

              candidates.set(assetIdentifier, {
                assetIdentifier,
                contractAddress,
                contractType: contractType as EVMSupportedNFTContractType,
                decimals: decimalsValue,
                name: NFTName,
                symbol: symbol,
                verified: NFTName !== "",
                metadata: {
                  tokenId: tokenId,
                  image: metadata?.imageUrl || null,
                  updatedAt: metadata?.imageUrl ? Date.now() : null,
                  accountAddress: accountAddress,
                },
              });
            }
          }
        }
      }
    }
  }

  return [...candidates.values()];
}
