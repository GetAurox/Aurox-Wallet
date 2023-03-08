import { memo, useMemo } from "react";

import orderBy from "lodash/orderBy";
import partition from "lodash/partition";

import { List, IconButton, Typography } from "@mui/material";

import { Add as AddIcon } from "@mui/icons-material";

import { SortSetting, TokenDisplayWithTicker } from "ui/types";
import { useLocalUserPreferences, useFuse, useCurrentTabDappConnectionInfo } from "ui/hooks";
import { useHistoryPush } from "ui/common/history";

import EmptyList from "ui/components/common/EmptyList";

import { defaultUserPreferences } from "common/storage";

import HomeListSubheader from "./HomeListSubheader";
import HomeTokenListItem from "./HomeTokenListItem";
import HomeListSubheaderSort from "./HomeListSubheaderSort";

const sxStyles = {
  list: {
    mt: "3px",
    listStyleType: "none",
  },
  buttonImportToken: {
    padding: 0,
  },
};

export interface HomeTokenListProps {
  tokens: TokenDisplayWithTicker[];
}

export default memo(function HomeTokenList(props: HomeTokenListProps) {
  const { tokens } = props;

  const push = useHistoryPush();

  const { connection, isDAppConnected } = useCurrentTabDappConnectionInfo();

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const sort = userPreferences.ownTokensSort;

  const chainSorting = (userPreferences?.general?.chainSorting ?? defaultUserPreferences?.general?.chainSorting) && isDAppConnected;

  const { fuzzyResults, onSearch, updateQuery } = useFuse(tokens, {
    keys: ["name", "symbol", "assetDefinition.contractAddress"],
    matchAllOnEmptyQuery: true,
  });

  const handleItemClick = (token: TokenDisplayWithTicker) => {
    push(`/token/network-specific/${token.key}`);
  };

  const handleSort = (newSort: SortSetting) => {
    setUserPreferences(preferences => ({ ...preferences, ownTokensSort: newSort }));
  };

  const handleGoToManageTokens = () => {
    push("/manage-tokens");
  };

  const handleSearchClose = () => {
    updateQuery("");
  };

  const ordered = useMemo(() => {
    const data = [];
    let sortDirection = sort.dir;

    if (chainSorting) {
      // 1. The top token is the native token of chainX (independent of the USD value)
      // 2. The next batch of tokens will be all tokens on chainX
      // 3. The next batch of tokens is the rest of the tokens sorted by USD value
      const [nativeToken, tokensWithoutNative] = partition(
        fuzzyResults,
        token => token.item.networkIdentifier === connection?.networkIdentifier && token.item.assetDefinition.type === "native",
      );

      data.push(nativeToken);

      const [tokenWithCurrentChain, tokenWithoutCurrentChain] = partition(
        tokensWithoutNative,
        token => token.item.networkIdentifier === connection?.networkIdentifier,
      );

      data.push(tokenWithCurrentChain);
      data.push(tokenWithoutCurrentChain);

      sortDirection = "desc";
    } else {
      data.push(fuzzyResults);
    }

    return data.flatMap(result => {
      const [tokensWithUSDBalance, tokensWithoutUSDBalance] = partition(result, token => token.item.balanceUSDValue !== null);

      return [
        ...orderBy(tokensWithUSDBalance, token => Number(token.item.balanceUSDValue), sortDirection),
        ...orderBy(tokensWithoutUSDBalance, token => Number(token.item.balance), sortDirection),
      ];
    });
  }, [fuzzyResults, sort, chainSorting, connection]);

  return (
    <>
      <HomeListSubheader
        sort={
          chainSorting ? (
            <Typography variant="medium" color="primary">
              &nbsp;Chain
            </Typography>
          ) : (
            <HomeListSubheaderSort onSort={handleSort} sort={sort} />
          )
        }
        title="My Balances"
        onSearch={onSearch}
        onSearchClose={handleSearchClose}
        icon={
          <IconButton sx={sxStyles.buttonImportToken} onClick={handleGoToManageTokens}>
            <AddIcon color="primary" />
          </IconButton>
        }
      />
      {tokens.length > 0 ? (
        <List sx={sxStyles.list}>
          {ordered.map(({ item: token }, index) => (
            <HomeTokenListItem key={index} token={token} onClick={handleItemClick} />
          ))}
        </List>
      ) : (
        <EmptyList text="You have no Tokens in this wallet" />
      )}
    </>
  );
});
