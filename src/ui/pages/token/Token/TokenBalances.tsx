import { Stack, Typography } from "@mui/material";

import { useHistoryPush } from "ui/common/history";

import { TokenDisplayWithTicker } from "ui/types";

import TokenBalanceListItem from "./TokenBalanceListItem";

export interface TokenBalancesProps {
  balances: TokenDisplayWithTicker[];
}

export default function TokenBalances(props: TokenBalancesProps) {
  const { balances } = props;

  const push = useHistoryPush();

  const createItemClickHandle = (token: TokenDisplayWithTicker) => () => {
    push(`/token/network-specific/${token.key}`);
  };

  return balances.length > 0 ? (
    <Stack component="section" rowGap={0.5}>
      <Typography variant="headingSmall" component="h4" mx={2}>
        My Network Balances
      </Typography>

      {balances.map((token, index) => (
        <TokenBalanceListItem
          key={token.key}
          token={token}
          onClick={createItemClickHandle(token)}
          divider={balances.length !== index + 1}
        />
      ))}
    </Stack>
  ) : (
    <></>
  );
}
