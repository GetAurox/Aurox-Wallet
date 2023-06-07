import { memo, useCallback } from "react";
import produce from "immer";
import clamp from "lodash/clamp";

import { Theme, Box, Divider } from "@mui/material";

import { evmNetworkGraphqlAPI } from "common/config";

import { TokenDisplayWithTicker } from "ui/types";
import { useNetworkGetter } from "ui/hooks";
import { BASIC_LIST_ITEM_HEIGHT } from "ui/common/constants";

import TokenSelectListItem from "ui/components/entity/token/TokenSelectListItem";
import DialogBase from "ui/components/common/DialogBase";
import ScrollableList from "ui/components/common/ScrollableList";
import NotFound from "ui/components/common/NotFound";

import { TokenSelectModalProps } from "./types";
import { useToTokens } from "./hooks";
import TokenSelectModalHeader from "./TokenSelectModalHeader";
import { DEFAULT_TOKENS_PER_PAGE } from "./config";

const listStyle = { listStyleType: "none" };

const sxStyles = {
  divider: {
    height: 0,
    borderColor: (theme: Theme) => theme.palette.custom.grey["25"],
  },
};

export default memo(function ToTokenSelectModal(props: Omit<TokenSelectModalProps, "direction">) {
  const { onClose, onTokenSelect, selectedTokenKey, excludeTokenKey, selectedNetworkIdentifier } = props;

  const { tokens, hasNextResults, loading, viewState, setViewState, onSearch } = useToTokens({
    excludeTokenKey,
    selectedNetworkIdentifier,
  });

  const networkGetter = useNetworkGetter();

  const createTokenSelectHandle = (token: TokenDisplayWithTicker) => () => {
    onTokenSelect(token);
  };

  const handleLoadMore = useCallback(() => {
    setViewState(
      produce(draft => {
        const draftLimit = draft.limit ?? 0;

        draft.offset = draftLimit > DEFAULT_TOKENS_PER_PAGE ? draftLimit : (draft.offset ?? 0) + DEFAULT_TOKENS_PER_PAGE;
        draft.limit = DEFAULT_TOKENS_PER_PAGE;
      }),
    );
  }, [setViewState]);

  return (
    <DialogBase
      open
      onClose={onClose}
      title={<TokenSelectModalHeader title="Swap to" onSearch={onSearch} />}
      content={
        tokens.length === 0 ? (
          !loading && <NotFound height="50vh" />
        ) : (
          <Box mx={-1.5}>
            <ScrollableList
              items={tokens}
              loadMore={handleLoadMore}
              hasNextPage={hasNextResults}
              listHeight={(BASIC_LIST_ITEM_HEIGHT + 1) * clamp(tokens.length, 0, 6)}
              listWidth="100%"
              listStyle={listStyle}
              itemSize={BASIC_LIST_ITEM_HEIGHT + 1}
              isNextPageLoading={loading}
            >
              {({ index, style }) => {
                const token = tokens[index];

                if (!token) return <Box key={index} style={style} />;

                let disabled = false;
                let disabledReason: string | undefined;

                if (!evmNetworkGraphqlAPI[token.networkIdentifier]) {
                  disabled = true;
                  disabledReason = `${networkGetter(token.networkIdentifier)?.name ?? "Network"} is not yet supported`;
                }

                const selected = token.key === selectedTokenKey;

                return (
                  <Box key={index} style={style}>
                    <TokenSelectListItem
                      token={token}
                      onClick={createTokenSelectHandle(token)}
                      disabled={disabled}
                      disabledReason={disabledReason}
                      selected={selected}
                    />
                    {index !== tokens.length && <Divider component="li" sx={sxStyles.divider} />}
                  </Box>
                );
              }}
            </ScrollableList>
          </Box>
        )
      }
    />
  );
});
