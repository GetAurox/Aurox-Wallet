import { LoadingButton } from "@mui/lab";
import SouthIcon from "@mui/icons-material/South";
import { Box, buttonClasses, Divider, Stack, Theme } from "@mui/material";

import { Pair } from "common/wallet";
import { TokenSwapSlippageTolerance } from "common/types";

import { EVMFeeStrategy } from "ui/common/fee";
import { USD_DECIMALS } from "ui/common/constants";

import { TokenDisplayWithTicker } from "ui/types";

import Header from "ui/components/layout/misc/Header";
import AlertStatus from "ui/components/common/AlertStatus";
import FixedPanel from "ui/components/layout/misc/FixedPanel";
import NetworkFee from "ui/components/flows/feeSelection/NetworkFee";

import { networkNativeCurrencyData } from "common/config";

import type { Amount } from "./InitialView";
import { calculatePricesAndAmounts } from "./helpers";

import TokenCard from "./TokenCard";

const sxStyles = {
  switch: {
    mt: 3,
    p: 0.25,
    mx: "auto",
    mb: "22px",
  },
  divider: {
    my: 2.25,
    borderColor: (theme: Theme) => theme.palette.custom.grey["19"],
  },
  loadingButton: {
    [`&.${buttonClasses.disabled}`]: {
      backgroundColor: (theme: Theme) => theme.palette.primary.main,
    },
  },
  arrowIconBox: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    display: "grid",
    placeItems: "center",
    backgroundColor: (theme: Theme) => theme.palette.custom.grey["19"],
  },
  arrowIcon: {
    fontSize: "16px",
    color: (theme: Theme) => theme.palette.custom.grey["60"],
  },
};

export interface PreviewViewProps {
  tokens: Pair<TokenDisplayWithTicker>;
  amounts: Pair<Amount>;
  slippage: TokenSwapSlippageTolerance;
  networkFeeUSD: number;
  gasless: boolean;
  loading?: boolean;
  feeManager: EVMFeeStrategy | null;
  onBackClick: () => void;
  onConfirmSwap: () => Promise<void>;
}

export default function PreviewView(props: PreviewViewProps) {
  const { tokens, amounts, gasless, onBackClick, onConfirmSwap, networkFeeUSD, feeManager, loading } = props;

  const [priceValues, amountValues] = calculatePricesAndAmounts(tokens, amounts, networkFeeUSD, gasless);

  return (
    <>
      <Header title={gasless ? "Preview Gasless Swap" : "Preview Swap"} onBackClick={onBackClick} />
      <Stack rowGap={2.25} m={2} mb={2.25} alignItems="center">
        <TokenCard title="Swap from" token={tokens.from} amount={`-${amountValues.from}`} price={priceValues.from} variant="negative" />

        {gasless && (
          <TokenCard
            variant="negative"
            title="Maximum Network Fee"
            token={tokens.from}
            amount={`-${amountValues.fee}`}
            price={networkFeeUSD.toFixed(USD_DECIMALS)}
          />
        )}

        <Box sx={sxStyles.arrowIconBox}>
          <SouthIcon sx={sxStyles.arrowIcon} />
        </Box>

        <TokenCard title="Swap to" token={tokens.to} price={priceValues.to} amount={`~${amountValues.to}`} variant="positive" />
      </Stack>

      <Divider variant="middle" />

      {!gasless && tokens.from && (
        <NetworkFee
          mx={2}
          token={tokens.from}
          feeManager={feeManager}
          title="Max Network Fee:"
          infoIconPosition="prefix"
          networkIdentifier={tokens.from.networkIdentifier}
          infoText="This is not a fee charged by Aurox. This is the maximum fee you are willing to pay blockchain validators to process your transaction."
        />
      )}

      <FixedPanel variant="bottom" disablePortal display="flex" flexDirection="column" rowGap={1.5} px={2} pb={2}>
        {gasless && (
          <AlertStatus
            warning
            warningText={`The output amount is an approximation. Any input tokens that are unused for the network fee will be automatically refunded to you in ${
              networkNativeCurrencyData[tokens.from.networkIdentifier].symbol
            } of equal USD value.`}
          />
        )}
        <LoadingButton fullWidth variant="contained" loading={loading} onClick={onConfirmSwap}>
          Confirm and Swap
        </LoadingButton>
      </FixedPanel>
    </>
  );
}
