import { MouseEvent } from "react";

import { ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";

import { formatPercents, formatPrice, formatBalance } from "ui/common/utils";
import { useApplyTokenDisplayMarketTicker } from "ui/hooks";
import { TokenDisplayWithTicker } from "ui/types";

import TokenAvatar from "ui/components/common/TokenAvatar";

const sxStyles = {
  favoriteButton: {
    p: 0,
  },
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
};

const getPriceColor = (price: number | string) => (Number(price) > 0 ? "#54c06e" : Number(price) < 0 ? "#f24840" : "grey");

export interface HomeTokenListItemProps {
  token: TokenDisplayWithTicker;
  onClick: (token: TokenDisplayWithTicker) => void;
}

export default function HomeTokenListItem(props: HomeTokenListItemProps) {
  const { token, onClick } = props;

  const handleItemButtonClick = (event: MouseEvent) => {
    event.preventDefault();

    onClick(token);
  };

  const tokenWithMarketTicker = useApplyTokenDisplayMarketTicker(token);

  const { priceUSD, balance, balanceUSDValue, priceChange24HPercent } = tokenWithMarketTicker;

  return (
    <ListItem disablePadding>
      <ListItemButton sx={sxStyles.listItemButton} onClick={handleItemButtonClick}>
        <ListItemAvatar sx={sxStyles.listItemAvatar}>
          <TokenAvatar {...token.img} networkIdentifier={token.networkIdentifier} />
        </ListItemAvatar>

        <ListItemText
          disableTypography
          sx={sxStyles.listItemText}
          primary={
            <Typography variant="large" maxWidth="9ch" noWrap fontWeight={500} lineHeight="20px">
              {token.symbol}
            </Typography>
          }
          secondary={
            priceUSD === null ? undefined : (
              <Typography variant="medium" color="text.secondary">
                ${formatPrice(priceUSD)}{" "}
                <Typography component="span" variant="inherit" color={getPriceColor(priceChange24HPercent ?? 0)}>
                  ({formatPercents(priceChange24HPercent ?? 0)}
                  %)
                </Typography>
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
      </ListItemButton>
    </ListItem>
  );
}
