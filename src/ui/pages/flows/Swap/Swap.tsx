import { useState, ChangeEvent, MouseEvent, Fragment, useMemo, useCallback } from "react";
import noop from "lodash/noop";

import { Theme, Button, Link, Collapse, Stack, Box, Divider, Typography } from "@mui/material";

import { TokenSwapSlippageTolerance, TokenSwapDirection } from "common/types";

import { useActiveAccountFlatTokenBalances, useAssertBalancesSynchronizedForAssets, useTokensDisplayWithTickers } from "ui/hooks";
import { useHistoryReset, useHistoryGoBack, useHistoryState } from "ui/common/history";
import { FeeConfiguration, defaultFeePreference, feeData } from "ui/common/fee";
import { TokenDisplayWithTicker } from "ui/types";
import { formatAmount } from "ui/common/utils";

import TokenSelectModal from "ui/components/modals/TokenSelectModal";
import TokenIdentity from "ui/components/entity/token/TokenIdentity";
import TokenSwitcher from "ui/components/entity/token/TokenSwitcher";
import IconExpandMore from "ui/components/styled/IconExpandMore";
import ExpandButton from "ui/components/styled/ExpandButton";
import InfoTooltip from "ui/components/info/InfoTooltip";
import Success from "ui/components/layout/misc/Success";
import Header from "ui/components/layout/misc/Header";
import FeeModal from "ui/components/modals/FeeModal";
import FormField from "ui/components/form/FormField";

import { IconChevronRight, IconSwitchSide } from "ui/components/icons";

import { getTokenSwapRouteStages, normalizeTokenSwapRouteStages } from "./utils";
import { mockTxHash, submittingTransaction, getSwapRoute } from "./mock";

import SwapSlippageSelector from "./SwapSlippageSelector";
import SwapSwitchButton from "./SwapSwitchButton";
import SwapRouteModal from "./SwapRouteModal";

const defaultSlippageTolerance: TokenSwapSlippageTolerance = "auto";

export default function Swap() {
  const reset = useHistoryReset();
  const goBack = useHistoryGoBack();

  const [fromAssetKey, setFromAssetKey] = useHistoryState<string | null>("fromAssetKey", null);
  const [toAssetKey, setToAssetKey] = useHistoryState<string | null>("toAssetKey", null);

  const [stage, setStage] = useState<null | "preview" | "completed">(null);
  const [expanded, setExpanded] = useState(false);
  const [slippage, setSlippage] = useState<TokenSwapSlippageTolerance>(defaultSlippageTolerance);
  const [memo, setMemo] = useState("");
  const [openRouteModal, setOpenRouteModal] = useState(false);
  const [openFeeModal, setOpenFeeModal] = useState(false);
  const [openTokenModal, setOpenTokenModal] = useState(false);
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [direction, setDirection] = useState<TokenSwapDirection | null>(null);
  const [lastEdited, setLastEdited] = useState<TokenSwapDirection | null>(null);
  const [fee, setFee] = useState<FeeConfiguration>(feeData[defaultFeePreference]);

  const tokens = useTokensDisplayWithTickers(useActiveAccountFlatTokenBalances());

  const swapFrom = tokens.find(token => token.key === fromAssetKey) ?? null;
  const swapTo = tokens.find(token => token.key === toAssetKey) ?? null;

  useAssertBalancesSynchronizedForAssets([fromAssetKey, toAssetKey]);

  const ratio = swapFrom?.priceUSD && swapTo?.priceUSD ? Number(swapFrom.priceUSD) / Number(swapTo.priceUSD) : null;

  const exceedsBalance = swapFrom ? Number(swapFrom.balance) < fromAmount : false;

  const filteredTokensForDirection = tokens.filter(token => {
    if (direction === "from" && token.key === swapTo?.key) return false;
    if (direction === "to" && token.key === swapFrom?.key) return false;

    return true;
  });

  const isCustomSlippage = typeof slippage === "object" && "custom" in slippage;
  const slippageError = isCustomSlippage && typeof slippage.custom === "number" && (slippage.custom < 0 || slippage.custom > 50);
  const slippageWarning =
    (typeof slippage === "number" && (slippage < 0.05 || slippage > 1)) ||
    (isCustomSlippage && typeof slippage.custom === "number" && (slippage.custom < 0.05 || slippage.custom > 1));

  const slippageRenderValue =
    slippage === "auto"
      ? "Auto"
      : isCustomSlippage
      ? typeof slippage.custom === "number"
        ? `${slippage.custom}%`
        : "Auto"
      : `${slippage}%`;

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  const handleGoInitial = () => {
    setStage(null);
  };

  const handleGoPreview = () => {
    setStage("preview");
    setExpanded(true);
  };

  const handleConfirmSwap = () => {
    setStage("completed");
  };

  const handleComplete = () => {
    reset(`/transactions/${mockTxHash}/details`);
  };

  const handleMemoChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMemo(event.target.value);
  };

  const handleOpenRouteModal = (event: MouseEvent) => {
    event.preventDefault();

    setOpenRouteModal(true);
  };

  const handleCloseRouteModal = () => {
    setOpenRouteModal(false);
  };

  const handleOpenFeeModal = (event: MouseEvent) => {
    event.preventDefault();

    setOpenFeeModal(true);
  };

  const handleCloseFeeModal = () => {
    setOpenFeeModal(false);
  };

  const handleFeeSelect = (fee: FeeConfiguration) => {
    setFee(fee);

    handleCloseFeeModal();
  };

  const handleOpenTokenModal = () => {
    setOpenTokenModal(true);
  };

  const handleCloseTokenModal = () => {
    setOpenTokenModal(false);
  };

  const createTokenClickHandle = useCallback(
    (dir: TokenSwapDirection) => () => {
      setDirection(dir);

      handleOpenTokenModal();
    },
    [],
  );

  const createTokenAmountChangeHandle = useCallback(
    (dir: TokenSwapDirection) => (value: number) => {
      let setter: typeof setFromAmount = noop;
      let opposite: typeof setToAmount = noop;
      let whatEdited: TokenSwapDirection | null = null;

      if (dir === "from") {
        setter = setFromAmount;
        opposite = setToAmount;
        whatEdited = "from";
      } else {
        setter = setToAmount;
        opposite = setFromAmount;
        whatEdited = "to";
      }

      setLastEdited(whatEdited);

      setter(value);

      if (ratio) {
        if (dir === "from") {
          opposite(value * ratio);
        } else {
          opposite(value / ratio);
        }
      }
    },
    [ratio],
  );

  const handleTokenSelect = (token: TokenDisplayWithTicker) => {
    if (direction === "from") {
      setFromAssetKey(token.key);
    } else {
      setToAssetKey(token.key);
    }

    setFromAmount(0);
    setToAmount(0);

    handleCloseTokenModal();
  };

  const handleSwitchSwap = () => {
    const currentFromAssetKey = fromAssetKey;
    const currentToAssetKey = toAssetKey;

    const currentFromAmount = fromAmount;
    const currentToAmount = toAmount;

    setFromAssetKey(currentToAssetKey);
    setToAssetKey(currentFromAssetKey);

    setFromAmount(currentToAmount);
    setToAmount(currentFromAmount);
  };

  const handleSlippageChange = (value: TokenSwapSlippageTolerance) => {
    setSlippage(value);
  };

  const swapRoute = useMemo(() => (swapFrom && swapTo ? getSwapRoute(swapFrom, swapTo) : null), [swapFrom, swapTo]);

  if (stage === "completed") {
    return (
      <Success
        heading="Complete"
        subheading="Operation is in progress"
        buttonDisabled={submittingTransaction}
        onButtonClick={handleComplete}
      />
    );
  }

  const swapRouteStages = getTokenSwapRouteStages(swapRoute);

  const normalizedSwapRouteStages = normalizeTokenSwapRouteStages(swapRouteStages);

  const routeRender = swapFrom && swapTo && swapRouteStages && normalizedSwapRouteStages && (
    <Stack mt="17px" px={2} direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="medium" color="text.secondary">
        Route
      </Typography>
      <Stack direction="row" alignItems="center">
        <Link href="#" underline="none" onClick={handleOpenRouteModal} title={swapRouteStages.join(" > ")}>
          <Stack direction="row" alignItems="center" component="span">
            {normalizedSwapRouteStages.map((name, index) => (
              <Fragment key={`${name}-${index}`}>
                {index > 0 && <IconChevronRight />}
                <Typography variant="medium">{name}</Typography>
              </Fragment>
            ))}
          </Stack>
        </Link>
      </Stack>
    </Stack>
  );

  const slippageRender = (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      {stage === "preview" ? (
        <>
          <Typography variant="medium" color="text.secondary">
            Slippage Tolerance
          </Typography>
          {slippageWarning ? (
            <Stack direction="row" alignItems="center" justifyContent="flex-end">
              <InfoTooltip variant="warning">
                <Typography variant="medium">Your transaction may fail or be front run.</Typography>
              </InfoTooltip>
              <Typography variant="medium" align="right">
                {slippageRenderValue}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="medium" align="right">
              {slippageRenderValue}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Stack direction="row" alignItems="center" flexGrow={1} flexShrink={0}>
            <Typography variant="medium" color="text.secondary">
              Slippage Tolerance:
            </Typography>
            <InfoTooltip>
              <Typography variant="small">
                Slippage tolerance establish a margin of change acceptable to the user beyond price impact. As long as the execution price
                is within the slippage range, e.g., %1, the transaction will be executed. If the execution price ends up outside of the
                accepted slippage range, the transaction will fail, and the swap will not occur.
              </Typography>
              <Typography variant="small" mt={0.5}>
                Slippage tolerance values outside of 0...50% are invalid.
              </Typography>
              <Typography variant="small" mt={0.5}>
                Transaction may fail for values less than 0.05%.
              </Typography>
              <Typography variant="small" mt={0.5}>
                Transaction may be front run for values more than 1%.
              </Typography>
              <Typography variant="medium" mt={1}>
                <Link
                  href="https://docs.uniswap.org/protocol/concepts/V3-overview/swaps#slippage"
                  target="_blank"
                  rel="noreferrer"
                  underline="hover"
                >
                  Learn more
                </Link>
              </Typography>
            </InfoTooltip>
          </Stack>
          <SwapSlippageSelector
            slippage={slippage}
            onChange={handleSlippageChange}
            error={slippageError}
            flexGrow={0}
            flexShrink={1}
            ml={1}
          />
        </>
      )}
    </Stack>
  );

  const memoRender =
    stage === "preview" ? (
      <Stack mt={1.5} direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="medium" color="text.secondary">
          Memo
        </Typography>
        <Typography variant="medium" align="right">
          {memo}
        </Typography>
      </Stack>
    ) : (
      <Box mt={2.75}>
        <FormField label="Memo" placeholder="Enter memo" name="memo" autoComplete="off" value={memo} onChange={handleMemoChange} />
      </Box>
    );

  const ratioRender = swapFrom && swapTo && ratio && (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="medium" color="text.secondary">
        Price:
      </Typography>
      <Typography variant="medium" align="right">
        ~{formatAmount(1 / ratio)} {swapFrom.symbol}
      </Typography>
    </Stack>
  );

  const networkFeeRender = (
    <Stack mt="10px" direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" alignItems="center">
        <Typography variant="medium" color="text.secondary">
          Network Fee:
        </Typography>
        <InfoTooltip>
          <Typography variant="large">
            Approximate network fee to submit the transaction to the selected blockchain. This fee is paid to the miners/stakers of the
            blockchain so that your transaction can be processed.
          </Typography>
          <Typography variant="large" mt={1}>
            <Link href="#" target="_blank" rel="noreferrer" underline="hover">
              Learn more
            </Link>
          </Typography>
        </InfoTooltip>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography variant="medium">~${formatAmount(fee.feeUSD)}</Typography>
        <Link href="#" underline="none" onClick={handleOpenFeeModal}>
          Edit
        </Link>
      </Stack>
    </Stack>
  );

  const auroxFeeRender = swapFrom && (
    <Stack mt="10px" direction="row" alignItems="center" justifyContent="space-between">
      <Typography variant="medium" color="text.secondary">
        Aurox Fee:
      </Typography>
      <Typography variant="medium" align="right">
        ${formatAmount(fromAmount * Number(swapFrom.priceUSD ?? 0) * 0.003)}
      </Typography>
    </Stack>
  );

  const approximateFeeRender = (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
      <Typography variant="medium">Approximate Network Fee: ${formatAmount(fee.feeUSD)}</Typography>
      <InfoTooltip>
        <Typography variant="large">
          Approximate network fee to submit the transaction to the selected blockchain. This fee is paid to the miners/stakers of the
          blockchain so that your transaction can be processed.
        </Typography>
        <Typography variant="large" mt={1}>
          <Link href="https://ethereum.org/en/developers/docs/gas/" target="_blank" rel="noreferrer" underline="hover">
            Learn more
          </Link>
        </Typography>
      </InfoTooltip>
    </Stack>
  );

  return (
    <>
      <Header title="Swap" onBackClick={stage === "preview" ? handleGoInitial : goBack} />

      <Stack mt="17px" px={2}>
        <Stack mb="7px" direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="medium">Swap from</Typography>
          <Typography variant="medium" color="text.secondary">
            Balance: ${formatAmount(Number(swapFrom?.balanceUSDValue ?? 0))}
          </Typography>
        </Stack>
        <TokenSwitcher
          approx={lastEdited === "to"}
          amount={fromAmount}
          price={Number(swapFrom?.priceUSD ?? 0)}
          balance={Number(swapFrom?.balance ?? 0)}
          onClick={createTokenClickHandle("from")}
          onChange={createTokenAmountChangeHandle("from")}
          disabled={stage === "preview"}
          error={exceedsBalance}
        >
          {swapFrom ? (
            <TokenIdentity {...swapFrom.img} primary={swapFrom.symbol} networkIdentifier={swapFrom.networkIdentifier} spacing={1} />
          ) : (
            <Typography variant="medium" lineHeight="24px">
              Select a token
            </Typography>
          )}
        </TokenSwitcher>
        {exceedsBalance && (
          <Typography variant="small" mt="7px" color="error.main">
            Amount must not exceed balance ({formatAmount(swapFrom?.balance ?? 0)}
            {swapFrom ? ` ${swapFrom.symbol}` : ""})
          </Typography>
        )}

        <SwapSwitchButton
          disableRipple
          sx={{ mt: 3, mb: "22px", mx: "auto", p: 0.25 }}
          variant="contained"
          disabled={stage === "preview"}
          onClick={handleSwitchSwap}
        >
          <IconSwitchSide />
        </SwapSwitchButton>

        <Stack mb="7px" direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="medium">Swap to</Typography>
          <Typography variant="medium" color="text.secondary">
            Balance: ${formatAmount(Number(swapTo?.balanceUSDValue ?? 0))}
          </Typography>
        </Stack>
        <TokenSwitcher
          approx={lastEdited === "from"}
          amount={toAmount}
          price={Number(swapTo?.priceUSD ?? 0)}
          balance={Number(swapTo?.balance ?? 0)}
          onClick={createTokenClickHandle("to")}
          onChange={createTokenAmountChangeHandle("to")}
          disabled={stage === "preview"}
        >
          {swapTo ? (
            <TokenIdentity {...swapTo.img} primary={swapTo.symbol} networkIdentifier={swapTo.networkIdentifier} spacing={1} />
          ) : (
            <Typography variant="medium" lineHeight="24px">
              Select a token
            </Typography>
          )}
        </TokenSwitcher>
      </Stack>

      {routeRender}
      <ExpandButton
        variant="text"
        disableRipple
        sx={{ mt: 4, mx: "auto" }}
        endIcon={<IconExpandMore expand={expanded} aria-expanded={expanded} aria-label="Advanced Options" />}
        onClick={handleExpandToggle}
      >
        Advanced Options
      </ExpandButton>
      <Collapse in={expanded} timeout="auto" unmountOnExit sx={{ p: 2 }}>
        {slippageRender}
        {memoRender}
        {stage === "preview" && (
          <>
            <Divider sx={{ my: 2.25, borderColor: (theme: Theme) => theme.palette.custom.grey["19"] }} />
            {ratioRender}
            {networkFeeRender}
            {auroxFeeRender}
          </>
        )}
      </Collapse>

      <Box flexGrow={1} />

      {stage === "preview" ? null : approximateFeeRender}

      <Button
        sx={{ mt: "19px", mx: 2, mb: 2 }}
        variant="contained"
        onClick={stage === "preview" ? handleConfirmSwap : handleGoPreview}
        disabled={!swapFrom || !swapTo || !fromAmount || !toAmount || exceedsBalance || slippageError}
      >
        {stage === "preview" ? "Confirm and Swap" : "Preview"}
      </Button>

      {swapRoute && openRouteModal && <SwapRouteModal onClose={handleCloseRouteModal} swapRoute={swapRoute} />}
      {openFeeModal && swapFrom?.networkIdentifier && (
        <FeeModal
          networkIdentifier={swapFrom.networkIdentifier}
          onClose={handleCloseFeeModal}
          onFeeSelect={handleFeeSelect}
          selectedFee={fee}
        />
      )}
      {openTokenModal && (
        <TokenSelectModal
          title={`Swap ${direction}`}
          tokens={filteredTokensForDirection}
          onClose={handleCloseTokenModal}
          onTokenSelect={handleTokenSelect}
          selectedToken={direction === "from" ? swapFrom : swapTo}
        />
      )}
    </>
  );
}
