import { ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { ArrowForwardIos as ArrowForwardIosIcon } from "@mui/icons-material";

import { TokenTransaction } from "common/types";

import { useHistoryPush } from "ui/common/history";
import { formatPrice } from "ui/common/utils";

import TokenTransactionStatusSecondary from "./TokenTransactionStatusSecondary";
import TokenTransactionStatusPrimary from "./TokenTransactionStatusPrimary";

const sxStyles = {
  arrowIcon: {
    fontSize: "1rem",
    color: "text.secondary",
  },
  itemIcon: {
    right: "10px",
    position: "absolute",
    minWidth: "min-content",
  },
  price: {
    minWidth: "fit-content",
  },
  status: {
    display: "block",
  },
};

export interface TokenTransactionListItemProps {
  item: TokenTransaction;
}

export default function TokenTransactionListItem(props: TokenTransactionListItemProps) {
  const { item } = props;

  const { txHash, valueUSD, status } = props.item;

  const push = useHistoryPush();

  const handleCoinDetailsClick = () => {
    push(`/transactions/${txHash}/details`);
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={handleCoinDetailsClick}
        sx={{ paddingTop: "13px", paddingBottom: status === "pending" ? "16px" : "13px", columnGap: 1 }}
      >
        <ListItemText
          disableTypography
          sx={sxStyles.status}
          primary={<TokenTransactionStatusPrimary item={item} />}
          secondary={<TokenTransactionStatusSecondary item={item} />}
        />
        <ListItemText
          disableTypography
          sx={sxStyles.price}
          primary={
            <Typography mr={3} fontSize="1rem" textAlign="right" fontWeight={500} lineHeight="20px" letterSpacing="0.5px">
              {typeof valueUSD === "number" ? formatPrice(valueUSD) : valueUSD}
            </Typography>
          }
        />
        <ListItemIcon sx={sxStyles.itemIcon}>
          <ArrowForwardIosIcon sx={sxStyles.arrowIcon} />
        </ListItemIcon>
      </ListItemButton>
    </ListItem>
  );
}
