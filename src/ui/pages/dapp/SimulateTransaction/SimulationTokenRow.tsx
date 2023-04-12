import { Theme, Stack, Typography } from "@mui/material";

import TokenIdentity from "ui/components/entity/token/TokenIdentity";
import { createNetworkIdentifier } from "common/utils";
import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config";

export interface SimulationTokenRowProps {
  amount: number | null;
  infinite: boolean;
  type: "in" | "out";
  skipAmountSign: boolean;
  name: string;
  image?: string;
  chainId?: number;
}

function getSimulationDisplayData(amount: number | null, type: "in" | "out", skipAmountSign: boolean, infinite: boolean) {
  if (infinite) {
    return { formattedAmount: "Infinite", sign: "", color: "warning.main" };
  }

  if (!amount) {
    return { formattedAmount: "", sign: "", color: "warning.main" };
  }

  const formattedAmount = Number.isInteger(amount) && amount === 1 ? amount.toFixed(0) : amount.toFixed(6);

  if (skipAmountSign) {
    return { formattedAmount, sign: "", color: "warning.main" };
  }

  const sign = type === "in" ? "+" : "-";
  const color = type === "in" ? "success.main" : "error.main";

  return { formattedAmount, sign, color };
}

export default function SimulationTokenRow(props: SimulationTokenRowProps) {
  const { amount, infinite, skipAmountSign, image, name, chainId, type } = props;

  const { formattedAmount, sign, color } = getSimulationDisplayData(amount, type, skipAmountSign, infinite);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      width={1}
      padding="10px 12px"
      border={(theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`}
      borderRadius={1.5}
      mt={2}
    >
      <TokenIdentity
        spacing={1}
        primary={name}
        src={image}
        alt={name}
        iconVariant="medium"
        primaryVariant="small"
        networkIdentifier={createNetworkIdentifier("evm", chainId ?? ETHEREUM_MAINNET_CHAIN_ID)}
      />

      <Typography variant="headingSmall" fontSize={24} lineHeight={32 / 24} color={color}>
        {sign}
        {formattedAmount}
      </Typography>
    </Stack>
  );
}
