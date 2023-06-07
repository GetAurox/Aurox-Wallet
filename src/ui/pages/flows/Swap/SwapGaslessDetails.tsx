import Decimal from "decimal.js";

import { Link, Stack, Typography } from "@mui/material";

import { getEstimatedGaslessTokenOutput } from "common/wallet";

import { TokenDisplayWithTicker } from "ui/types";

import InfoTooltip from "ui/components/info/InfoTooltip";
import RefreshButton from "ui/components/common/RefreshButton";

export interface SwapGaslessDetailsProps {
  token?: TokenDisplayWithTicker | null;
  amount?: string;
  networkFeeUSD?: number;
  onRefresh: () => void;
}

export default function SwapGaslessDetails(props: SwapGaslessDetailsProps) {
  const { token, amount, networkFeeUSD, onRefresh } = props;

  if (!token?.priceUSD || !amount || !networkFeeUSD) {
    return <></>;
  }

  const estimatedTokenOutput = getEstimatedGaslessTokenOutput(amount, token.priceUSD, networkFeeUSD);

  if (!estimatedTokenOutput) {
    return <></>;
  }

  const priceUSD = new Decimal(estimatedTokenOutput).times(token.priceUSD).toFixed(2);

  return (
    <Stack direction="row" alignItems="start" justifyContent="space-between" columnGap={0.5}>
      <Stack direction="row" alignItems="center" flexGrow={1} flexShrink={0}>
        <Typography variant="medium" color="text.secondary">
          Minimum tokens expected:
        </Typography>
        <InfoTooltip>
          <Stack>
            <Typography variant="small">Network fee is charged for in output tokens, therefore the expected output is reduced</Typography>
            <Typography variant="medium" mt={1}>
              <Link
                href="https://docs.getaurox.com/product-docs/aurox-ecosystem/aurox-ecosystem/the-aurox-protocol/aurox-trade/gasless-swaps"
                target="_blank"
                rel="noreferrer"
                underline="hover"
              >
                Learn more
              </Link>
            </Typography>
          </Stack>
        </InfoTooltip>
      </Stack>
      <Stack>
        <Stack direction="row" alignItems="center" columnGap={0.5}>
          <RefreshButton onClick={onRefresh} />
          <Typography variant="medium" align="right">
            ~{estimatedTokenOutput} {token.symbol}
          </Typography>
        </Stack>
        <Typography sx={{ fontSize: "13px" }} color="text.secondary" align="right">
          ${priceUSD}
        </Typography>
      </Stack>
    </Stack>
  );
}
