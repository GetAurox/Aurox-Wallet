import { ChangeEvent, useState } from "react";
import produce from "immer";
import without from "lodash/without";

import { Box, Stack, Theme, Typography } from "@mui/material";
import { Star as StarIcon, StarBorder as StarBorderIcon } from "@mui/icons-material";

import { EasterEgg } from "ui/common/rewardSystem";
import { useHistoryStateStashPopper, useHistoryState } from "ui/common/history";

import SearchField from "ui/components/form/SearchField";

import MarketTokens, { DEFAULT_TOKENS_PER_PAGE } from "./MarketTokens";

import { MarketsViewStateValues } from "./types";

const sxStyles = {
  root: {
    overflowY: "hidden",
  },
  title: {
    mt: 2.5,
    fontSize: 24,
  },
  titleDense: {
    mt: 1,
    fontSize: 16,
  },
  searchField: {
    inputBase: {
      "&.MuiPaper-root": {
        borderRadius: 12,
        backgroundColor: (theme: Theme) => theme.palette.custom.grey["19"],
      },
    },
  },
  disabledButtonFavorites: {
    color: (theme: Theme) => theme.palette.custom.grey["70"],
  },
  searchBlinker: {
    top: 8,
    left: 8,
    right: "auto",
  },
};

const defaultViewState = { offset: 0, search: "", tokenIndex: 0, limit: DEFAULT_TOKENS_PER_PAGE };

export default function Markets() {
  const [filters, setFilters] = useHistoryState<"favorites"[]>("marketTokenFilters", []);

  const popStash = useHistoryStateStashPopper();

  const [isVisible, setIsVisible] = useState(true);
  const [viewState, setViewState] = useState<MarketsViewStateValues>(popStash("markets") ?? defaultViewState);

  const search = viewState.search;
  const isFavoritesFilterSet = filters.some(filter => filter === "favorites");

  const handleFavoritesFilter = () => {
    setFilters(prevState => {
      const isFavoriteFilterSet = prevState.some(filter => filter === "favorites");

      return isFavoriteFilterSet ? without(prevState, "favorites") : [...prevState, "favorites"];
    });
    setViewState(
      produce(draft => {
        draft.limit = defaultViewState.limit;
        draft.offset = defaultViewState.offset;
        draft.search = defaultViewState.search;
        draft.tokenIndex = defaultViewState.tokenIndex;
      }),
    );
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setViewState(
      produce(draft => {
        draft.offset = defaultViewState.offset;
        draft.limit = DEFAULT_TOKENS_PER_PAGE;
        draft.search = event.target.value;
        draft.tokenIndex = defaultViewState.tokenIndex;
      }),
    );
  };

  const handleSearchClear = () => {
    setViewState(
      produce(draft => {
        draft.limit = defaultViewState.limit;
        draft.offset = defaultViewState.offset;
        draft.search = defaultViewState.search;
        draft.tokenIndex = defaultViewState.tokenIndex;
      }),
    );
  };

  const handleScroll = (value: boolean) => {
    setIsVisible(value);
  };

  return (
    <Stack rowGap={1.5} sx={sxStyles.root}>
      <Typography component="h1" align="center" fontWeight={500} sx={isVisible ? sxStyles.title : sxStyles.titleDense}>
        Markets
      </Typography>
      <Box mx={2}>
        <EasterEgg campaignId="coin_searched" blinkerSx={sxStyles.searchBlinker}>
          <SearchField
            resetControl
            value={search}
            placeholder="Search"
            sx={sxStyles.searchField}
            onClear={handleSearchClear}
            onChange={handleSearchChange}
            onClickEndIcon={handleFavoritesFilter}
            endIcon={isFavoritesFilterSet ? <StarIcon color="primary" /> : <StarBorderIcon sx={sxStyles.disabledButtonFavorites} />}
          />
        </EasterEgg>
      </Box>
      <MarketTokens onScroll={handleScroll} search={viewState.search || ""} viewState={viewState} setViewState={setViewState} />
    </Stack>
  );
}
