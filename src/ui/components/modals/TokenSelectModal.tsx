import { FixedSizeList } from "react-window";
import orderBy from "lodash/orderBy";
import clamp from "lodash/clamp";

import { Theme, Box, paperClasses, inputBaseClasses, Divider, Typography } from "@mui/material";

import { ethereumMainnetNetworkIdentifier } from "common/config";

import { TokenDisplayWithTicker } from "ui/types";
import { useFuse } from "ui/hooks";
import { BASIC_LIST_ITEM_HEIGHT } from "ui/common/constants";

import TokenSelectListItem from "ui/components/entity/token/TokenSelectListItem";
import DialogBase from "ui/components/common/DialogBase";
import SearchField from "ui/components/form/SearchField";

const listStyle = { listStyleType: "none" };

const sxStyles = {
  searchField: {
    inputBase: {
      [`&.${inputBaseClasses.root}`]: {
        py: "3px",
      },
    },
    inputPaper: {
      [`&.${paperClasses.root}`]: {
        borderColor: (theme: Theme) => theme.palette.custom.grey["30"],
        backgroundColor: (theme: Theme) => theme.palette.custom.grey["30"],
      },
    },
  },
  divider: {
    height: 0,
    borderColor: (theme: Theme) => theme.palette.custom.grey["25"],
  },
};

export interface TokenSelectModalProps {
  tokens: TokenDisplayWithTicker[];
  title: string;
  onClose: () => void;
  onTokenSelect: (token: TokenDisplayWithTicker) => void;
  selectedToken: TokenDisplayWithTicker | null;
}

export default function TokenSelectModal(props: TokenSelectModalProps) {
  const { tokens, title, onClose, onTokenSelect, selectedToken } = props;

  const { fuzzyResults, onSearch } = useFuse<TokenDisplayWithTicker>(tokens, {
    keys: ["name", "symbol", "assetDefinition.contractAddress"],
    matchAllOnEmptyQuery: true,
  });

  const ordered = orderBy(fuzzyResults, ({ item }) => (item.balanceUSDValue ? Number(item.balanceUSDValue) : 0), "desc");

  const createTokenSelectHandle = (token: TokenDisplayWithTicker) => () => {
    onTokenSelect(token);
  };

  return (
    <DialogBase
      open
      onClose={onClose}
      title={
        <>
          <Typography variant="headingSmall" align="center">
            {title}
          </Typography>
          <Box width={1} mt="10px">
            <SearchField placeholder="Search" onChange={onSearch} sx={sxStyles.searchField} />
          </Box>
        </>
      }
      content={
        <>
          <Box mx={-1.5}>
            <FixedSizeList
              width="100%"
              itemData={ordered}
              style={listStyle}
              itemCount={ordered.length}
              itemSize={BASIC_LIST_ITEM_HEIGHT + 1}
              height={(BASIC_LIST_ITEM_HEIGHT + 1) * clamp(ordered.length, 0, 6)}
            >
              {({ data, index, style }) => {
                const token = data[index].item;

                // TODO: Remove when support for other chains are added
                const disabled = token.networkIdentifier !== ethereumMainnetNetworkIdentifier;
                const selected = token.key === selectedToken?.key;

                return (
                  <Box key={index} style={style}>
                    <TokenSelectListItem
                      token={token}
                      onClick={createTokenSelectHandle(token)}
                      disabled={disabled}
                      disabledReason={disabled ? "X-Chain Swapping Coming Soon" : undefined}
                      selected={selected}
                    />
                    {index !== ordered.length && <Divider component="li" sx={sxStyles.divider} />}
                  </Box>
                );
              }}
            </FixedSizeList>
          </Box>
        </>
      }
    />
  );
}
