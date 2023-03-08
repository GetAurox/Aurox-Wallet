import { FixedSizeList } from "react-window";
import { ChangeEvent } from "react";
import orderBy from "lodash/orderBy";

import { Stack, Box, Divider, inputBaseClasses, Typography } from "@mui/material";

import { applyTokenAssetVisibilityRules } from "common/utils";

import { BASIC_LIST_ITEM_HEIGHT } from "ui/common/constants";
import { useHistoryGoBack, useHistoryPush } from "ui/common/history";

import { useActiveAccountFlatTokenBalances, useFuse, useNetworkGetter, useTokensDisplayWithTickers } from "ui/hooks";
import { TokenDisplayWithTicker } from "ui/types";

import TokenSelectListItem from "ui/components/entity/token/TokenSelectListItem";
import SearchField from "ui/components/form/SearchField";
import Header from "ui/components/layout/misc/Header";

const listStyle = { listStyleType: "none" };

const sxStyles = {
  searchField: {
    inputBase: {
      [`&.${inputBaseClasses.root}`]: {
        py: "3px",
      },
    },
  },
  divider: {
    height: 0,
  },
};

export interface TokenFuzzyResult {
  fuzzyResults: { item: TokenDisplayWithTicker }[];
  onSearch: (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
}

export function SendSelect() {
  const push = useHistoryPush();
  const goBack = useHistoryGoBack();

  const tokens = useTokensDisplayWithTickers(useActiveAccountFlatTokenBalances());

  const getNetwork = useNetworkGetter();

  const visibleTokens = tokens.filter(applyTokenAssetVisibilityRules);

  const { fuzzyResults, onSearch }: TokenFuzzyResult = useFuse<TokenDisplayWithTicker>(visibleTokens, {
    keys: ["name", "symbol", "assetDefinition.contractAddress"],
    matchAllOnEmptyQuery: true,
  });

  const ordered = orderBy(fuzzyResults, ({ item }) => (item.balanceUSDValue ? Number(item.balanceUSDValue) : 0), "desc");

  const onTokenSelect = (token: TokenDisplayWithTicker) => {
    const network = getNetwork(token.networkIdentifier);

    if (!network) {
      throw new Error(`User doesn't have a network matching ${token.networkIdentifier}`);
    }

    push("/send", { assetKey: token.key });
  };

  return (
    <>
      <Header title="Send" onBackClick={goBack} />
      <Stack width={1} px={2}>
        <Box width={1} mb="10px">
          <SearchField placeholder="Search" sx={sxStyles.searchField} onChange={onSearch} />
        </Box>
        <Stack mb="3px" direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="headingSmall">Select a Coin</Typography>
          <Typography variant="medium" align="right" color="text.secondary">
            Current balance
          </Typography>
        </Stack>
        <Box mx={-2}>
          <FixedSizeList
            width="100%"
            itemData={ordered}
            style={listStyle}
            itemCount={ordered.length}
            itemSize={BASIC_LIST_ITEM_HEIGHT}
            height={document.body.clientHeight - 56 - 50 - 24 - 3}
          >
            {({ data, index, style }) => {
              const currentToken = data[index].item;
              const handleClick = () => onTokenSelect(currentToken);

              return (
                <Box key={index} style={style}>
                  <TokenSelectListItem token={currentToken} onClick={handleClick} selected={false} />
                  {index !== ordered.length - 1 && <Divider component="li" sx={sxStyles.divider} />}
                </Box>
              );
            }}
          </FixedSizeList>
        </Box>
      </Stack>
    </>
  );
}
