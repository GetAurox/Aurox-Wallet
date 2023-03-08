import { ethers } from "ethers";

import { Theme, Stack, Typography } from "@mui/material";

import TokenIdentity from "ui/components/entity/token/TokenIdentity";
import { formatBalance, TEN_MILLIONS } from "ui/common/utils";
import { createNetworkIdentifier } from "common/utils";
import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config";

export interface SimulationTokenRowProps {
  amount: string | null;
  skipAmountSign?: boolean;
  decimals: number | null;
  name: string;
  image?: string;
  type?: "in" | "out";
}

export default function SimulationTokenRow(props: SimulationTokenRowProps) {
  const { amount, skipAmountSign, decimals, image, name, type } = props;

  let formattedAmount = "0";

  if (amount) {
    if (ethers.constants.MaxUint256.eq(amount)) {
      formattedAmount = "Infinite";
    } else {
      if (decimals) {
        formattedAmount =
          decimals > 0
            ? formatBalance(Number.parseInt(amount) / Math.pow(10, decimals), TEN_MILLIONS)
            : formatBalance(Number.parseInt(amount), TEN_MILLIONS);
      }
    }
  }

  let amountSign = "";

  if (!skipAmountSign) {
    amountSign = type === "in" ? "+" : "-";
  }

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
        networkIdentifier={createNetworkIdentifier("evm", ETHEREUM_MAINNET_CHAIN_ID)}
      />
      {formattedAmount !== "0" && (
        <Typography variant="headingSmall" fontSize={24} lineHeight={32 / 24} color={type === "in" ? "success.main" : "error.main"}>
          {amountSign}
          {formattedAmount}
        </Typography>
      )}
    </Stack>
  );
}
