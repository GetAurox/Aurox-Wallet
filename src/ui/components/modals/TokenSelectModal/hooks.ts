import { useMemo, useState, useCallback, ChangeEvent } from "react";
import produce from "immer";
import orderBy from "lodash/orderBy";

import { DEFAULT_DECIMALS, ETH_ADDRESS, evmNetworkGraphqlAPI } from "common/config";
import { applyTokenAssetVisibilityRules, createAssetKey, createNetworkIdentifier, getAssetIdentifierFromDefinition } from "common/utils";
import { AssetDefinition } from "common/types";

import { FlatTokenBalanceInfo, TokenDisplayWithTicker } from "ui/types";
import { useActiveAccountFlatTokenBalances, useFuse, useNetworkByIdentifier, useTokens, useTokensDisplayWithTickers } from "ui/hooks";

import { orderByBalance } from "./utils";
import { TokenSelectModalProps, TokenSelectViewState } from "./types";
import { DEFAULT_TOKENS_PER_PAGE, defaultViewState } from "./config";

export function useFromTokens(props: Pick<TokenSelectModalProps, "excludeTokenKey">) {
  const { excludeTokenKey } = props;

  const flatTokenBalances = useActiveAccountFlatTokenBalances();
  const tokensDisplayWithTicker = useTokensDisplayWithTickers(flatTokenBalances);
  const visibleTokens = useMemo(() => tokensDisplayWithTicker.filter(applyTokenAssetVisibilityRules), [tokensDisplayWithTicker]);
  const { fuzzyResults, onSearch } = useFuse<TokenDisplayWithTicker>(visibleTokens, {
    keys: ["name", "symbol", "assetDefinition.contractAddress"],
    matchAllOnEmptyQuery: true,
  });

  const supported: TokenDisplayWithTicker[] = [];
  const notSupported: TokenDisplayWithTicker[] = [];

  for (const { item } of fuzzyResults) {
    if (excludeTokenKey && item.key === excludeTokenKey) continue;

    if (!evmNetworkGraphqlAPI[item.networkIdentifier]) {
      notSupported.push(item);
    } else {
      supported.push(item);
    }
  }

  const tokens = orderByBalance(supported).concat(orderByBalance(notSupported));

  return { tokens, onSearch };
}

export function useToTokens(props: Pick<TokenSelectModalProps, "excludeTokenKey" | "selectedNetworkIdentifier">) {
  const { excludeTokenKey, selectedNetworkIdentifier } = props;

  const [viewState, setViewState] = useState<TokenSelectViewState>(defaultViewState);
  const { offset, search, limit } = viewState;

  const selectedChainId = useNetworkByIdentifier(selectedNetworkIdentifier)?.chainId;

  const flatTokenBalances = useActiveAccountFlatTokenBalances();
  const {
    tokens: allMarketCoins,
    hasNextResults,
    loading,
  } = useTokens(offset, search, limit, undefined, selectedChainId ? [selectedChainId.toString()] : undefined);
  const results: (FlatTokenBalanceInfo & { marketCap: string })[] = [];

  for (const marketCoin of allMarketCoins) {
    for (const marketToken of marketCoin.tokens) {
      const chainId = Number(marketToken.chainId);
      const networkIdentifier = createNetworkIdentifier("evm", chainId);

      if (!evmNetworkGraphqlAPI[networkIdentifier]) continue;
      if (selectedNetworkIdentifier && networkIdentifier !== selectedNetworkIdentifier) continue;

      const contractAddress = marketToken.address.toLowerCase();
      const assetDefinition: AssetDefinition =
        contractAddress === ETH_ADDRESS.toLowerCase()
          ? { type: "native" }
          : {
              type: "contract",
              contractType: "ERC20",
              contractAddress: String(contractAddress).toLowerCase(),
            };
      const assetIdentifier = getAssetIdentifierFromDefinition(assetDefinition);
      const assetKey = createAssetKey(networkIdentifier, assetIdentifier);

      if (excludeTokenKey && assetKey === excludeTokenKey) continue;

      const flatTokenBalance = flatTokenBalances.find(token => token.key === assetKey);

      if (flatTokenBalance) {
        results.push({ ...flatTokenBalance, marketCap: marketCoin.mc });
      } else {
        results.push({
          ...assetDefinition,
          key: assetKey,
          networkIdentifier,
          assetIdentifier,
          chainType: "evm",
          chainId,
          visibility: "default",
          verified: false,
          autoImported: false,
          symbol: marketCoin.sn,
          name: marketCoin.fn,
          // @TODO: this is assertion - need to use real decimals
          decimals: DEFAULT_DECIMALS,
          balance: "0",
          balanceUSDValue: null,
          marketCap: marketCoin.mc,
        });
      }
    }
  }

  const tokensDisplayWithTickers = useTokensDisplayWithTickers(results);

  const tokens = orderBy(
    tokensDisplayWithTickers,
    [
      candidate => (candidate.balanceUSDValue ? Number(candidate.balanceUSDValue) : 0),
      candidate => (candidate.balance ? Number(candidate.balance) : 0),
      (candidate, index) => (results[index]?.marketCap ? Number(results[index]?.marketCap) : 0),
    ],
    ["desc", "desc"],
  );

  const onSearch = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setViewState(
      produce(draft => {
        draft.offset = 0;
        draft.limit = DEFAULT_TOKENS_PER_PAGE;
        draft.search = event.target.value;
      }),
    );
  }, []);

  return { tokens, hasNextResults, loading, viewState, setViewState, onSearch };
}
