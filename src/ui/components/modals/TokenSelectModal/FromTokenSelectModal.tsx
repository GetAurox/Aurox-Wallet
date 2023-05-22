import { memo } from "react";
import { FixedSizeList } from "react-window";
import clamp from "lodash/clamp";

import { Theme, Box, Divider } from "@mui/material";

import { evmNetworkGraphqlAPI } from "common/config";

import { useNetworkGetter } from "ui/hooks";
import { TokenDisplayWithTicker } from "ui/types";

import { BASIC_LIST_ITEM_HEIGHT } from "ui/common/constants";

import TokenSelectListItem from "ui/components/entity/token/TokenSelectListItem";
import DialogBase from "ui/components/common/DialogBase";

import { TokenSelectModalProps } from "./types";
import { useFromTokens } from "./hooks";
import TokenSelectModalHeader from "./TokenSelectModalHeader";

const listStyle = { listStyleType: "none" };

const sxStyles = {
  divider: {
    height: 0,
    borderColor: (theme: Theme) => theme.palette.custom.grey["25"],
  },
};

export default memo(function FromTokenSelectModal(props: Omit<TokenSelectModalProps, "direction" | "selectedNetworkIdentifier">) {
  const { onClose, onTokenSelect, selectedTokenKey, excludeTokenKey } = props;

  const { tokens, onSearch } = useFromTokens({ excludeTokenKey });

  const networkGetter = useNetworkGetter();

  const createTokenSelectHandle = (token: TokenDisplayWithTicker) => () => {
    onTokenSelect(token);
  };

  return (
    <DialogBase
      open
      onClose={onClose}
      title={<TokenSelectModalHeader title="Swap from" onSearch={onSearch} />}
      content={
        <Box mx={-1.5}>
          <FixedSizeList
            width="100%"
            itemData={tokens}
            style={listStyle}
            itemCount={tokens.length}
            itemSize={BASIC_LIST_ITEM_HEIGHT + 1}
            height={(BASIC_LIST_ITEM_HEIGHT + 1) * clamp(tokens.length, 0, 6)}
          >
            {({ data, index, style }) => {
              const token = data[index];
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
          </FixedSizeList>
        </Box>
      }
    />
  );
});
