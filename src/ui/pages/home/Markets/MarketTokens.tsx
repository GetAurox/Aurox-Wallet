import { useState, useCallback, Dispatch, SetStateAction } from "react";
import produce from "immer";

import { useHistoryPush, useHistoryState, useHistoryStateStasher } from "ui/common/history";
import { useSyncFavoriteAssets, useTokens } from "ui/hooks";
import { GraphQLMarketsAPICoin } from "ui/types";

import { BASIC_LIST_ITEM_HEIGHT } from "ui/common/constants";

import ScrollableList from "ui/components/common/ScrollableList";
import NotFound from "ui/components/common/NotFound";

import { MarketsViewStateValues } from "./types";
import MarketsTokenRow from "./MarketsTokenRow";

export const DEFAULT_TOKENS_PER_PAGE = 20;
const ROW_WIDTH = "100%";
const HEADER_HEIGHT = 150;

export interface MarketTokensProps {
  viewState: MarketsViewStateValues;
  setViewState: Dispatch<SetStateAction<MarketsViewStateValues>>;
  onScroll: (value: boolean) => void;
  search: string;
}

export default function MarketTokens(props: MarketTokensProps) {
  const { viewState, setViewState, onScroll, search } = props;

  const [isVisible, setIsVisible] = useState(true);

  const [filters, setFilters] = useHistoryState<"favorites"[]>("marketTokenFilters", []);

  const stateStasher = useHistoryStateStasher();

  const push = useHistoryPush();

  const [favoriteAssets] = useSyncFavoriteAssets();

  const offset = viewState.offset ?? 0;

  const tokenIndex = viewState.tokenIndex ?? 0;
  const limit = viewState.limit ?? DEFAULT_TOKENS_PER_PAGE;
  const isFavoritesFilterSet = filters.some(filter => filter === "favorites");

  const { tokens, hasNextResults, loading, error } = useTokens(offset, search, limit, isFavoritesFilterSet ? favoriteAssets : undefined);

  const handleLoadMore = useCallback(() => {
    setViewState(
      produce(draft => {
        const draftLimit = draft.limit ?? 0;

        draft.offset = draftLimit > DEFAULT_TOKENS_PER_PAGE ? draftLimit : (draft.offset ?? 0) + DEFAULT_TOKENS_PER_PAGE;
        draft.limit = DEFAULT_TOKENS_PER_PAGE;
      }),
    );
  }, [setViewState]);

  const handleTokenRowClick = useCallback(
    (token: GraphQLMarketsAPICoin, index: number) => {
      const assetId = token.tokens?.filter(item => item.assetId > 0)[0]?.assetId;

      if (typeof assetId !== "number") return;

      const viewStateToStash = produce(viewState, draft => {
        const draftOffset = draft.offset ?? 0;
        const draftLimit = draft.limit ?? DEFAULT_TOKENS_PER_PAGE;

        // If NOT scenario:
        // market page -> token page -> market page (come back and without scrolling) -> token page
        // we're changing the limit
        if (!(draftOffset === 0 && draftLimit > DEFAULT_TOKENS_PER_PAGE)) {
          draft.limit = draftOffset > 0 ? draftOffset + DEFAULT_TOKENS_PER_PAGE : DEFAULT_TOKENS_PER_PAGE;
        }

        draft.tokenIndex = index;
        draft.offset = 0;
      });

      stateStasher<MarketsViewStateValues>("markets", viewStateToStash);

      push(`/token/global/${assetId}`);
    },
    [push, stateStasher, viewState],
  );

  const handleScroll = (value: boolean) => {
    if (value !== isVisible) {
      setIsVisible(value);
      onScroll(value);
    }
  };

  const notFound = tokens?.length === 0 && !loading && <NotFound height="50vh" />;

  const scrollToIndex = tokens.length > 0 && tokenIndex > 0 ? tokenIndex : 0;

  return (
    <>
      {tokens?.length === 0 && !loading ? (
        notFound
      ) : (
        <ScrollableList
          rowWidth={ROW_WIDTH}
          items={tokens}
          loadMore={handleLoadMore}
          isNextPageLoading={loading}
          hasNextPage={hasNextResults}
          scrollToIndex={scrollToIndex}
          itemSize={BASIC_LIST_ITEM_HEIGHT}
          onScrollingChanged={handleScroll}
          rowHeight={document.body.clientHeight - HEADER_HEIGHT}
        >
          {props => (
            <MarketsTokenRow
              error={error}
              onClick={handleTokenRowClick}
              token={tokens[props.index] || null}
              isFavoritesFilterSet={isFavoritesFilterSet}
              loading={loading && props.index === tokens.length}
              {...props}
            />
          )}
        </ScrollableList>
      )}
    </>
  );
}
