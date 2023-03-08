import { MouseEvent } from "react";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { ListItem, ListItemButton, listItemButtonClasses, ListItemText, Stack, Theme, Typography } from "@mui/material";

import { AccountInfo } from "common/types";
import { getAccountAddressForChainType } from "common/utils";

import { formatPrice } from "ui/common/utils";
import { useAccountPortfolioUSDValue, useVisibleTokensDisplayWithTickers } from "ui/hooks";

import CopyableText from "ui/components/clipboard/CopyableText";
import TokenIconDisplay from "ui/components/entity/token/TokenIconDisplay";

const sxStyles = {
  listItemButton: {
    pt: 1.5,
    pr: 2,
    pb: 2,
    pl: 1.5,
  },
};

export interface AccountListItemProps {
  arrow?: boolean;
  isActive?: boolean;
  account: AccountInfo;
  onClick?: (account: AccountInfo) => void;
}

export default function AccountListItem(props: AccountListItemProps) {
  const { account, isActive, onClick, arrow } = props;

  const tokens = useVisibleTokensDisplayWithTickers(account.uuid);

  const accountPortfolioUSDValue = useAccountPortfolioUSDValue(account.uuid);

  const address = getAccountAddressForChainType(account, "evm");

  const handleClick = async (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    event.stopPropagation();

    onClick?.(account);
  };

  const sxListItem = {
    border: "1px solid",
    borderRadius: "10px",
    [`& .${listItemButtonClasses.root}`]: {
      pr: 2,
    },
    borderColor: (theme: Theme) => `${isActive ? theme.palette.primary.main : theme.palette.custom.grey["19"]}`,
  };

  return (
    <ListItem
      disablePadding
      sx={sxListItem}
      secondaryAction={arrow ? <KeyboardArrowRightIcon color={isActive ? "primary" : "disabled"} /> : undefined}
    >
      <ListItemButton dense sx={sxStyles.listItemButton} onClick={handleClick}>
        <ListItemText
          disableTypography
          primary={
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" columnGap={0.5} mb="2px">
                <Typography variant="large" fontWeight={500} letterSpacing="0.15px" noWrap>
                  {account?.alias}
                </Typography>
                <Typography variant="large" fontWeight={500} letterSpacing="0.15px">
                  ${formatPrice(accountPortfolioUSDValue ?? 0)}
                </Typography>
              </Stack>
              <CopyableText text={address} />
              <TokenIconDisplay tokens={tokens} mb={0} />
            </>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}
