import { Stack, Theme, Typography } from "@mui/material";
import { ReactElement } from "react";

import TokenIdentity from "ui/components/entity/token/TokenIdentity";
import { type TokenDisplayWithTicker } from "ui/types";

const sxStyles = {
  root: {
    px: 1.5,
    pt: 1.5,
    pb: 2.5,
    borderRadius: 2.5,
    width: "-webkit-fill-available",
    border: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
  },
};

export interface TokenCardProps {
  title: string | ReactElement;
  token: TokenDisplayWithTicker;
  amount: string;
  price: string | null;
  variant?: "positive" | "negative";
}

export default function TokenCard(props: TokenCardProps) {
  const { token, title, amount, price, variant } = props;

  const color = variant === "positive" ? "success.main" : variant === "negative" ? "error.main" : "text.primary";

  return (
    <Stack direction="row" sx={sxStyles.root} justifyContent="space-between">
      <Stack rowGap={1.25}>
        <Typography component="span" variant="medium">
          {title}
        </Typography>
        <TokenIdentity
          {...token.img}
          columnGap={1.5}
          primaryVariant="small"
          primary={token.symbol}
          networkIdentifier={token.networkIdentifier}
        />
      </Stack>
      <Stack justifyContent="end">
        <Typography noWrap fontSize={24} letterSpacing="1.15px" fontWeight={500} lineHeight="32px" color={color} textAlign="right">
          {amount}
        </Typography>
        <Typography variant="small" color="text.secondary" textAlign="right">
          ${price}
        </Typography>
      </Stack>
    </Stack>
  );
}
