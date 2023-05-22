import { memo } from "react";

import { Link, Stack, Typography } from "@mui/material";

import InfoTooltip from "ui/components/info/InfoTooltip";

import { TokenSwapSlippageTolerance } from "common/types";

import SwapSlippageSelector from "./SwapSlippageSelector";

export const defaultSlippageTolerance: TokenSwapSlippageTolerance = "auto";

export type SlippageAlertStatus = "warning" | "error" | null;

function getSlippageRenderValue(slippage: TokenSwapSlippageTolerance) {
  const isCustom = typeof slippage === "object" && "custom" in slippage;

  if (!isCustom && typeof slippage === "number") {
    return `${slippage}%`;
  } else if (isCustom && typeof slippage.custom === "number") {
    return `${slippage.custom}%`;
  } else {
    return "Auto";
  }
}

export function getSlippageAlertStatus(slippage: TokenSwapSlippageTolerance): SlippageAlertStatus {
  const isCustomSlippage = typeof slippage === "object" && "custom" in slippage;

  const slippageError = isCustomSlippage && typeof slippage.custom === "number" && (slippage.custom < 0 || slippage.custom > 50);

  if (slippageError) {
    return "error";
  }

  const slippageNumberWarning = typeof slippage === "number" && (slippage < 0.05 || slippage > 1);

  const slippageCustomNumberWarning =
    isCustomSlippage && typeof slippage.custom === "number" && (slippage.custom < 0.05 || slippage.custom > 1);

  if (slippageNumberWarning || slippageCustomNumberWarning) {
    return "warning";
  }

  return null;
}

export type SwapSlippageProps =
  | {
      inPreview: false;
      slippage: TokenSwapSlippageTolerance;
      onSlippageChange: (value: TokenSwapSlippageTolerance) => void;
    }
  | {
      inPreview: true;
      slippage: TokenSwapSlippageTolerance;
    };

export default memo(function SwapSlippage(props: SwapSlippageProps) {
  const { inPreview, slippage } = props;

  const slippageRenderValue = getSlippageRenderValue(slippage);

  const slippageAlertStatus = getSlippageAlertStatus(slippage);

  if (inPreview) {
    return (
      <Stack direction="column" alignItems="start" justifyContent="space-between" rowGap={1.5}>
        {slippageAlertStatus === "warning" ? (
          <Stack direction="row" alignItems="center" justifyContent="flex-end">
            <InfoTooltip variant="warning">
              <Typography variant="medium">Your transaction may fail or be front run.</Typography>
            </InfoTooltip>
            <Typography variant="medium">Slippage Tolerance</Typography>
            <Typography variant="medium" align="right">
              {slippageRenderValue}
            </Typography>
          </Stack>
        ) : (
          <>
            <Typography variant="medium">Slippage Tolerance</Typography>
            <Typography variant="medium" align="right">
              {slippageRenderValue}
            </Typography>
          </>
        )}
      </Stack>
    );
  }

  return (
    <Stack direction="row" alignItems="center" columnGap={0.5}>
      <Stack direction="row" columnGap={0.25} alignItems="center" flexGrow={1} flexShrink={0}>
        <InfoTooltip>
          <Stack rowGap={0.5}>
            <Typography variant="medium">Acceptable slippage value is from 0% to 50% (not including 50%).</Typography>
            <Typography variant="medium">
              Slippage tolerance is the amount of price change a user is willing to accept when making a trade. For example, if the trader
              sets a 1% slippage tolerance, the trade will go through as long as the final price is within 1% of the expected price. If the
              final price is outside this range, the trade won&apos;t happen.
            </Typography>
            <Typography variant="medium">
              If you set the value below 0.05%, your trade might not go through. If you set it above 1%, bots might frontrun your
              transaction and increase your entry cost.
            </Typography>
            <Link
              mt={0.5}
              variant="medium"
              href="https://docs.getaurox.com/product-docs/aurox-wallet-guides/slippage"
              target="_blank"
              rel="noreferrer"
              underline="hover"
            >
              Learn more
            </Link>
          </Stack>
        </InfoTooltip>
        <Typography variant="medium">Slippage Tolerance:</Typography>
      </Stack>
      <SwapSlippageSelector
        flexGrow={0}
        flexShrink={1}
        slippage={slippage}
        onChange={props.onSlippageChange}
        error={slippageAlertStatus === "error"}
      />
    </Stack>
  );
});
