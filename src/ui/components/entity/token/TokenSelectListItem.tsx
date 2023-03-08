import { styled, Theme, ListItemButton, ListItemButtonProps, Stack, Typography } from "@mui/material";

import { TokenDisplayWithTicker } from "ui/types";
import { formatAmount } from "ui/common/utils";

import TokenIdentity from "ui/components/entity/token/TokenIdentity";

const CustomListItem = styled(ListItemButton)({
  padding: "15px 16px",

  ["&.Mui-disabled"]: {
    opacity: 1,
  },
});

export interface TokenListItemProps extends ListItemButtonProps {
  token: TokenDisplayWithTicker;
  disabledReason?: string;
}

export default function TokenSelectListItem(props: TokenListItemProps) {
  const { token, disabled, disabledReason, selected, onClick, ...rest } = props;

  return (
    <CustomListItem disableRipple disabled={disabled} selected={selected} onClick={onClick} {...rest}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" width={1}>
        <TokenIdentity
          {...token.img}
          spacing={1.5}
          iconVariant="large"
          disabled={disabled}
          primary={token.symbol}
          primaryVariant="medium"
          secondary={disabledReason}
          networkIdentifier={token.networkIdentifier}
        />
        <Stack alignItems="flex-end" spacing={0.25}>
          <Typography
            variant="medium"
            fontWeight={500}
            letterSpacing="normal"
            color={(theme: Theme) => (disabled ? theme.palette.custom.grey["30"] : theme.palette.text.primary)}
            align="right"
          >
            ${formatAmount(Number(token.balance) * Number(token.priceUSD ?? 0))}
          </Typography>
          <Typography
            variant="small"
            color={(theme: Theme) => (disabled ? theme.palette.custom.grey["30"] : theme.palette.text.secondary)}
            align="right"
          >
            {formatAmount(token.balance)} {token.symbol}
          </Typography>
        </Stack>
      </Stack>
    </CustomListItem>
  );
}
