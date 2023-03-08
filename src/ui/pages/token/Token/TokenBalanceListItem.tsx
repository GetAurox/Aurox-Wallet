import { MouseEvent } from "react";

import { Divider, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";

import { ContractAssetDefinition } from "common/types";

import { TokenDisplayWithTicker } from "ui/types";
import { useApplyTokenDisplayMarketTicker } from "ui/hooks";
import { collapseIdentifier, formatBalance, formatPrice } from "ui/common/utils";

import { IconArrow } from "ui/components/icons";
import TokenAvatar from "ui/components/common/TokenAvatar";

const sxStyles = {
  listItemText: {
    display: "grid",
    gap: "2px",
  },
  listItemAvatar: {
    minWidth: 40,
    minHeight: 36,
  },
  listItemButton: {
    py: "13px",
    display: "flex",
    columnGap: 1,
  },
  endIcon: {
    "&.MuiListItemIcon-root": {
      mr: -1,
    },
  },
};

export interface TokenBalanceListItemProps {
  token: TokenDisplayWithTicker;
  onClick: (token: TokenDisplayWithTicker) => void;
  divider: boolean;
}

export default function TokenBalanceListItem(props: TokenBalanceListItemProps) {
  const { token, onClick, divider } = props;

  const handleItemButtonClick = (event: MouseEvent) => {
    event.preventDefault();

    onClick(token);
  };

  const tokenWithMarketTicker = useApplyTokenDisplayMarketTicker(token);

  const { priceUSD, balance, balanceUSDValue } = tokenWithMarketTicker;

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton sx={sxStyles.listItemButton} onClick={handleItemButtonClick}>
          <ListItemAvatar sx={sxStyles.listItemAvatar}>
            <TokenAvatar {...token.img} networkIdentifier={token.networkIdentifier} />
          </ListItemAvatar>

          <ListItemText
            disableTypography
            sx={sxStyles.listItemText}
            primary={
              <Typography fontSize="16px" fontWeight={500} lineHeight="20px" letterSpacing={0.5}>
                {token.symbol}
              </Typography>
            }
            secondary={
              priceUSD === null ? undefined : (
                <Typography color="primary.main">
                  {collapseIdentifier((token.assetDefinition as ContractAssetDefinition).contractAddress)}
                </Typography>
              )
            }
          />
          <ListItemText
            sx={sxStyles.listItemText}
            disableTypography
            primary={
              <Typography fontSize="16px" textAlign="right" fontWeight={500} lineHeight="20px" letterSpacing={0.5}>
                {balanceUSDValue === null ? formatBalance(balance) : `$${formatPrice(balanceUSDValue)}`}
              </Typography>
            }
            secondary={
              balanceUSDValue === null ? undefined : (
                <Typography variant="medium" textAlign="right" color="text.secondary">
                  {formatBalance(balance)}
                </Typography>
              )
            }
          />
          <ListItemIcon sx={sxStyles.endIcon}>
            <IconArrow />
          </ListItemIcon>
        </ListItemButton>
      </ListItem>
      {divider && <Divider variant="middle" component="li" />}
    </>
  );
}
