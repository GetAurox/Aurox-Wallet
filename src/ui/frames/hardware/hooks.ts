import { useEffect, useState } from "react";
import axios from "axios";

import { AssetDefinition } from "common/types";
import {
  createAssetKey,
  createNetworkIdentifier,
  getAssetDefinitionFromIdentifier,
  getAssetIdentifierFromDefinition,
  getNetworkDefinitionFromIdentifier,
  isNativeAsset,
} from "common/utils";
import { AUROX_BLOCKCHAIN_GRAPHQL_BASE_URL, ETH_ADDRESS, GRAPHQL_LEECHER_X_API_KEY } from "common/config";

import { createFlatBalanceItemFromNativeAsset, useNetworkGetter } from "ui/hooks";
import { FlatTokenBalanceInfo } from "ui/types";

export function useAccountTokenExternalBalance(accountAddress: string) {
  interface BalancePayload {
    valueUSD?: string | null;
    tokens?: {
      chainId: string;
      amount: string;
      valueUSD: string | null;
      token: { address: string; name: string; symbol: string; decimals: number; verified: boolean };
    }[];
  }

  interface ResponsePayload {
    data?: {
      account?: {
        balance?: BalancePayload;
      };
    };
  }

  const [balancePayload, setBalancePayload] = useState<BalancePayload>({});

  const networkGetter = useNetworkGetter();

  useEffect(() => {
    const fetchBalances = async () => {
      const query = `{
            account(addresses: [{address:"${accountAddress}"}]) {
              balance {
                valueUSD
                tokens {
                  chainId,
                  amount: value(convert: native)
                  valueUSD : value(convert: USD)
                  token { address, name, symbol, decimals, verified }
                }
              }
          }
        }`;

      const response = await axios.post<ResponsePayload>(
        AUROX_BLOCKCHAIN_GRAPHQL_BASE_URL,
        { query },
        { headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY } },
      );

      setBalancePayload(response.data?.data?.account?.balance ?? {});
    };

    fetchBalances();
  }, [accountAddress]);

  const { tokens = [], valueUSD } = balancePayload;

  const result = [];

  for (const token of tokens) {
    if (!token?.token?.address) continue;

    let assetDefinition: AssetDefinition = {
      type: "contract",
      contractType: "ERC20",
      contractAddress: String(token.token.address).toLowerCase(),
    };

    if (token.token.address.toLowerCase() === ETH_ADDRESS.toLowerCase()) {
      assetDefinition = { type: "native" };
    }

    const assetIdentifier = getAssetIdentifierFromDefinition(assetDefinition);

    const networkIdentifier = createNetworkIdentifier("evm", Number(token.chainId));

    if (Number(token.amount) <= 0) continue;

    const balanceInfo = {
      assetIdentifier,
      balance: token.amount,
      balanceUSDValue: token.valueUSD ?? null,
    };

    if (isNativeAsset(assetIdentifier)) {
      const network = networkGetter(networkIdentifier);

      if (network) {
        result.push(createFlatBalanceItemFromNativeAsset(networkIdentifier, balanceInfo, network));
      }

      continue;
    }

    const { name, symbol, decimals, verified } = token.token;

    const flatBalanceItem: FlatTokenBalanceInfo = {
      key: createAssetKey(networkIdentifier, assetIdentifier),
      ...getAssetDefinitionFromIdentifier(assetIdentifier),
      ...getNetworkDefinitionFromIdentifier(networkIdentifier),
      name,
      symbol,
      decimals,
      verified,
      visibility: "default",
      autoImported: false,
      assetIdentifier,
      networkIdentifier,
      balance: balanceInfo.balance,
      balanceUSDValue: balanceInfo.balanceUSDValue,
    };

    result.push(flatBalanceItem);
  }

  return { balances: result, totalUSDValue: valueUSD ?? null };
}
