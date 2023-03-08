import axios from "axios";

import { evmNetworkGraphqlAPI, GRAPHQL_LEECHER_X_API_KEY } from "common/config";
import { BlockchainNetwork, MultichainNetworkBalances } from "common/types";
import { getAssetIdentifierFromDefinition } from "common/utils";

import { createEVMChainERC20BalanceOfResolver } from "./evmChainERC20BalanceOfResolver";

interface ResponsePayload {
  data?: {
    ethereum?: {
      account?: {
        balance?: {
          valueUSD: string | null;
          root: { amount: string; valueUSD: string | null };
          tokens: { amount: string; valueUSD: string | null; token: { address: string } }[];
        };
      };
    };
  };
}

export function isNetworkSupportedForEVMLeecherResolver(network: BlockchainNetwork) {
  return !!evmNetworkGraphqlAPI[network.identifier];
}

export function createEVMLeecherResolver(network: BlockchainNetwork, accountAddress: string) {
  if (!isNetworkSupportedForEVMLeecherResolver(network)) {
    throw new Error(`Network ${network.identifier} is not supported for this resolver`);
  }

  return async function resolveViaEVMLeecher(signal?: AbortSignal): Promise<MultichainNetworkBalances> {
    const { baseURL } = evmNetworkGraphqlAPI[network.identifier];

    const query = `{
      ethereum {
        account(accountAddress: "${accountAddress}") {
          balance {
            valueUSD
            root: ETH {
              amount
              valueUSD
            }
            tokens {
              amount
              valueUSD
              token { address }
            }
          }
        }
      }
    }`;

    const response = await axios.post<ResponsePayload>(baseURL, { query }, { signal, headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY } });

    const { valueUSD, root, tokens } = response.data?.data?.ethereum?.account?.balance ?? {};

    const result: MultichainNetworkBalances = {
      networkIdentifier: network.identifier,
      hasUSDBalanceValues: !!valueUSD,
      totalPortfolioValueUSD: valueUSD ?? null,
      balances: {},
    };

    const rootAssetIdentifier = getAssetIdentifierFromDefinition({ type: "native" });

    const rpcBalanceTargets = [rootAssetIdentifier];

    if (root) {
      result.balances[rootAssetIdentifier] = {
        assetIdentifier: rootAssetIdentifier,
        balance: root.amount ?? "0",
        balanceUSDValue: root.valueUSD ?? null,
      };
    }

    if (Array.isArray(tokens)) {
      for (const token of tokens) {
        if (!token?.token?.address) continue;

        const assetIdentifier = getAssetIdentifierFromDefinition({
          type: "contract",
          contractType: "ERC20",
          contractAddress: String(token.token.address).toLowerCase(),
        });

        rpcBalanceTargets.push(assetIdentifier);

        result.balances[assetIdentifier] = {
          assetIdentifier,
          balance: token.amount,
          balanceUSDValue: token.valueUSD ?? null,
        };
      }
    }

    try {
      const rpcResult = await createEVMChainERC20BalanceOfResolver(network, accountAddress, rpcBalanceTargets)(signal);

      /*
      // This logic has been temporarily disabled to prevent usd balances from jumping on and off when the
      // indexer is slightly behind the rpc provider. since it might take some time for the indexer
      // to catch up, there will be a time where the balances will not match and therefore the USD value
      // will not be used and badly impact the UX, a better solution needs to be devised

      // TODO: find a better solution to tolerate indexer/rpc discrepancies

      // The RPC should be the main source of truth, we can only rely on the backend for the USD values
      for (const [assetIdentifier, balanceInfo] of Object.entries(rpcResult.balances)) {
        if (result.balances[assetIdentifier]?.balanceUSDValue) {
          const indexerBalanceValue = Number(result.balances[assetIdentifier].balance);
          const rpcBalanceValue = Number(balanceInfo.balance);

          if (indexerBalanceValue === rpcBalanceValue) {
            // only add the USD value if the balances actually match, if they don't it means that the indexer is behind
            // the current block and the USD value will be wrong

            balanceInfo.balanceUSDValue = result.balances[assetIdentifier].balanceUSDValue;
          }
        }
      }
      */

      // Copy the USD values from the indexer while prioritizing PRC provider results
      const indexerBalances = result.balances;

      result.balances = rpcResult.balances;

      for (const [assetIdentifier, balanceInfo] of Object.entries(result.balances)) {
        if (indexerBalances[assetIdentifier]?.balanceUSDValue) {
          balanceInfo.balanceUSDValue = indexerBalances[assetIdentifier].balanceUSDValue;
        }
      }
    } catch (error) {
      // ignore this error, rpc assertion is an added benefit, it shouldn't break in case the rpc is down
      console.error("Failed to assert balances with the RPC:", error);
    }

    return result;
  };
}
