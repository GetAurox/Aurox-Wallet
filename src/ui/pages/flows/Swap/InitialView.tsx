import { memo, useCallback, useReducer } from "react";
import Decimal from "decimal.js";
import produce from "immer";

import { LoadingButton } from "@mui/lab";
import { Box, checkboxClasses, Divider, Link, snackbarClasses, snackbarContentClasses, Stack, Typography } from "@mui/material";

import { DEFAULT_SLIPPAGE, Pair } from "common/wallet";
import { ethereumMainnetNetworkIdentifier, proxySwapAddressMapping } from "common/config";
import { BlockchainNetwork, TokenSwapDirection, TokenSwapSlippageTolerance } from "common/types";

import { EVMFeeStrategy } from "ui/common/fee";
import { useHistoryGoBack, useHistoryState } from "ui/common/history";

import { TokenDisplayWithTicker } from "ui/types";

import { IconSwitchSide } from "ui/components/icons";
import Checkbox from "ui/components/common/Checkbox";
import ErrorText from "ui/components/form/ErrorText";
import Header from "ui/components/layout/misc/Header";
import InfoTooltip from "ui/components/info/InfoTooltip";
import AlertStatus from "ui/components/common/AlertStatus";
import FixedPanel from "ui/components/layout/misc/FixedPanel";
import TokenSwitcher from "ui/components/entity/token/TokenSwitcher";
import TokenSelectModal from "ui/components/modals/TokenSelectModal";
import NetworkFee from "ui/components/flows/feeSelection/NetworkFee";

import SwapSlippage from "./SwapSlippage";
import SwapSwitchButton from "./SwapSwitchButton";
import { defaultExchange, ExchangeState } from "./Swap";
import WaitingApprovalModal from "./WaitingApprovalModal";
import { updateTokenPairValues } from "./helpers";

const defaultValues: typeof defaultExchange.values = { from: { amount: "", currency: "" }, to: { amount: "", currency: "" } };

export type Amount = `${number}` | `${number}.${number}` | "";
interface InitialViewState {
  approving: boolean;
  switchToUSD: Pair<boolean>;
  lastEdited: "from" | "to" | null;
  openModal: "from" | "to" | "wait-approval" | null;
}

type InitialViewAction =
  | {
      type: "SET_APPROVING";
      payload: InitialViewState["approving"];
    }
  | {
      type: "SET_SWITCH_TO_USD";
      payload: InitialViewState["switchToUSD"];
    }
  | {
      type: "SET_LAST_EDITED";
      payload: InitialViewState["lastEdited"];
    }
  | {
      type: "SET_OPEN_MODAL";
      payload: InitialViewState["openModal"];
    };

const reducer = produce((draft: InitialViewState, action: InitialViewAction) => {
  switch (action.type) {
    case "SET_APPROVING":
      draft.approving = action.payload;
      break;
    case "SET_SWITCH_TO_USD":
      draft.switchToUSD = action.payload;
      break;
    case "SET_LAST_EDITED":
      draft.lastEdited = action.payload;
      break;
    case "SET_OPEN_MODAL":
      draft.openModal = action.payload;
      break;
    default:
      throw new Error("Invalid action type");
  }
});

const sxStyles = {
  switch: {
    mt: 1.5,
    mb: 0.5,
    p: 0.25,
    mx: "auto",
  },
  snackbar: {
    [`&.${snackbarClasses.root}`]: {
      bottom: 76,
    },
    [`& .${snackbarContentClasses.root}`]: {
      py: 0,
      borderRadius: "10px",
      backgroundColor: "#323232",
    },
  },
  checkbox: {
    [`&.${checkboxClasses.root}`]: {
      width: "20px",
      height: "20px",
      m: 0,
      p: 0,
      ml: "auto",
    },
  },
  tooltip: {
    mx: 2,
    maxWidth: "none",
    mb: "24px !important",
  },
};

export interface InitialViewProps {
  loading: boolean;
  gasless?: boolean;
  swapError?: string;
  approvalError?: string;
  hasEnoughFunds: boolean;
  needsApproval?: boolean;
  swapNetworkFeeUSD: number;
  approvalNetworkFeeUSD: number;
  feeManager: EVMFeeStrategy | null;
  network: BlockchainNetwork | null;
  values?: typeof defaultExchange.values;
  slippage?: TokenSwapSlippageTolerance;
  tokens: Pair<TokenDisplayWithTicker | null>;
  requestSwap: () => void;
  sendApproval: () => Promise<void>;
  onExchangeChange: (exchange: Partial<ExchangeState>) => void;
}

export default memo(function InitialView(props: InitialViewProps) {
  const {
    needsApproval,
    approvalNetworkFeeUSD,
    swapNetworkFeeUSD,
    approvalError,
    swapError,
    loading,
    hasEnoughFunds,
    sendApproval,
    requestSwap,
    onExchangeChange,
    values = defaultValues,
    slippage = DEFAULT_SLIPPAGE,
    gasless: enabledGaslessSwapping = false,
    feeManager,
    tokens,
    network,
  } = props;

  const initialState: InitialViewState = {
    approving: false,
    lastEdited: null,
    openModal: null,
    switchToUSD: { from: true, to: true },
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const { approving, lastEdited, openModal, switchToUSD } = state;

  const goBack = useHistoryGoBack();

  const [toTokenKey, setToTokenKey] = useHistoryState("toTokenKey", "");
  const [fromTokenKey, setFromTokenKey] = useHistoryState("fromTokenKey", "");

  const fromAmountDecimal = new Decimal(values.from.amount || "0");
  const fromBalanceDecimal = new Decimal(tokens.from?.balance ?? "0");

  const networkFeeUSD = approvalNetworkFeeUSD + swapNetworkFeeUSD;

  const networkFeeUSDDecimal = new Decimal(networkFeeUSD);

  const fromTokenPriceUSDDecimal = new Decimal(tokens.from?.priceUSD ?? 0);

  const fromTokenExceeds25PercentOfSwap =
    fromAmountDecimal.greaterThan(0) && networkFeeUSDDecimal.greaterThan(fromAmountDecimal.times(fromTokenPriceUSDDecimal).div(4));

  const fromTokenExceedsBalance = fromBalanceDecimal.minus(fromAmountDecimal).isNeg();

  const zeroAmounts = (tokens.from && fromBalanceDecimal.isZero()) || fromAmountDecimal.isZero();

  const usingSameNetwork = !!tokens.from && tokens.from.networkIdentifier === tokens.to?.networkIdentifier;

  const direction = openModal && openModal !== "wait-approval" ? openModal : undefined;

  // Gasless swapping is available only for ERC20 tokens on the Ethereum mainnet
  const availableGaslessSwapping =
    usingSameNetwork &&
    tokens.from?.networkIdentifier === ethereumMainnetNetworkIdentifier &&
    tokens.from.assetDefinition.type !== "native";

  const gasless = enabledGaslessSwapping && availableGaslessSwapping;

  const showApproval = !gasless && needsApproval && tokens.from && !zeroAmounts;

  const swapEnabled = usingSameNetwork && !fromTokenExceedsBalance && !zeroAmounts && !showApproval && Number(values.from.amount) > 0;

  const getError = () => {
    let errorText: string | null = null;

    if (fromTokenExceedsBalance) {
      errorText = "You do not have enough tokens for this swap";
    } else if (tokens.from && tokens.to && !usingSameNetwork) {
      errorText = "Tokens must be on the same network";
    } else if (!enabledGaslessSwapping && needsApproval && approvalError) {
      errorText = `Unable to handle approval, details: ${approvalError}`;
    } else if (!needsApproval && swapError) {
      errorText = `This swap will probably fail, details: ${swapError}`;
    } else if (!hasEnoughFunds && !gasless && tokens.from && tokens.to && swapNetworkFeeUSD) {
      errorText = "Insufficient funds to send this transaction";
    } else if (gasless && swapError) {
      errorText = swapError;
    }

    return errorText;
  };

  const createTokenClickHandle = (direction: TokenSwapDirection) => () => {
    dispatch({ type: "SET_OPEN_MODAL", payload: direction });
  };

  const handleCloseTokenModal = useCallback(() => {
    dispatch({ type: "SET_OPEN_MODAL", payload: null });
  }, []);

  const handleTokenValueChange = (direction: TokenSwapDirection) => (value: { amount: string; currency: string }) => {
    const newValues = updateTokenPairValues(tokens, value, direction);

    onExchangeChange({ values: newValues });
  };

  const handleSwitchToUSD = useCallback(
    (direction: TokenSwapDirection) => () => {
      dispatch({
        type: "SET_SWITCH_TO_USD",
        payload: { ...switchToUSD, [direction]: !switchToUSD[direction] },
      });
    },
    [switchToUSD],
  );

  const handleSwitchSwap = () => {
    setFromTokenKey(toTokenKey);
    setToTokenKey(fromTokenKey);

    const gasless =
      enabledGaslessSwapping &&
      tokens.to?.networkIdentifier === ethereumMainnetNetworkIdentifier &&
      tokens.to?.assetDefinition.type !== "native";

    const newValues = {
      from: values.to,
      to: values.from,
    };

    onExchangeChange({ values: newValues, gasless });
  };

  const handleTokenSelect = useCallback(
    (token: TokenDisplayWithTicker) => {
      if (!direction) {
        throw new Error("Token selection modal is already closed, please report this problem");
      }

      const tokenChanged = direction === "from" ? fromTokenKey !== token.key : toTokenKey !== token.key;

      if (!tokenChanged) {
        dispatch({ type: "SET_OPEN_MODAL", payload: null });

        return;
      }

      const tokenKeySetter = direction === "from" ? setFromTokenKey : setToTokenKey;

      const pairTokenDirection = direction === "from" ? "to" : "from";

      tokenKeySetter(token.key);

      dispatch({ type: "SET_LAST_EDITED", payload: direction });
      dispatch({ type: "SET_OPEN_MODAL", payload: null });

      const newValues = updateTokenPairValues(
        {
          [pairTokenDirection]: tokens[pairTokenDirection],
          [direction]: token,
        },
        values[pairTokenDirection],
        pairTokenDirection,
      );

      const chainId = direction === "from" ? token?.networkDefinition?.chainId : tokens.from?.networkDefinition?.chainId;

      const swapContract = chainId ? proxySwapAddressMapping[chainId] : undefined;

      const gasless = enabledGaslessSwapping && token.networkIdentifier === ethereumMainnetNetworkIdentifier;

      onExchangeChange({ values: newValues, swapContract, gasless });
    },
    [direction, fromTokenKey, onExchangeChange, setFromTokenKey, setToTokenKey, toTokenKey, tokens, values, enabledGaslessSwapping],
  );

  const toggleGaslessSwapping = () => {
    if (!availableGaslessSwapping) {
      console.error("Gasless swapping is not available for this token");
    }

    onExchangeChange({ gasless: !enabledGaslessSwapping && availableGaslessSwapping });
  };

  const handleWaitingApprovalModalClose = useCallback(() => {
    dispatch({ type: "SET_OPEN_MODAL", payload: null });
  }, []);

  const handleSlippageChange = useCallback(
    (value: TokenSwapSlippageTolerance) => {
      onExchangeChange({ slippage: value });
    },
    [onExchangeChange],
  );

  const handleApproveToken = async () => {
    if (!tokens.from) {
      throw new Error("Can not approve, nothing is selected");
    }

    if (approving) {
      dispatch({ type: "SET_OPEN_MODAL", payload: "wait-approval" });

      return;
    }

    dispatch({ type: "SET_APPROVING", payload: true });

    try {
      dispatch({ type: "SET_OPEN_MODAL", payload: "wait-approval" });
      await sendApproval();
    } finally {
      dispatch({ type: "SET_APPROVING", payload: false });
    }
  };

  const handleGoToPreview = () => {
    if (!tokens.from || !tokens.to) {
      throw new Error("Can not move to preview without making token selection first");
    }

    if (!values.from.amount || !values.to.amount) {
      throw new Error("Can not move to preview without setting the amounts first");
    }

    if (needsApproval && !enabledGaslessSwapping) {
      throw new Error("You have to approve tokens first");
    }

    requestSwap();
  };

  return (
    <>
      <Stack overflow="auto" flexGrow={1}>
        <Header title="Swap" onBackClick={goBack} />
        <Stack mt="17px" mx={2}>
          <TokenSwitcher
            cappedByBalance
            title="Swap from"
            token={tokens.from}
            value={values.from}
            approx={lastEdited === "to"}
            networkFeeUSD={networkFeeUSD}
            switchToUSD={switchToUSD.from}
            exceedsBalance={fromTokenExceedsBalance}
            onSwitchToUSD={handleSwitchToUSD("from")}
            onClick={createTokenClickHandle("from")}
            onChange={handleTokenValueChange("from")}
          />

          <SwapSwitchButton disableRipple sx={sxStyles.switch} variant="contained" onClick={handleSwitchSwap}>
            <IconSwitchSide />
          </SwapSwitchButton>

          <TokenSwitcher
            title="Swap to"
            token={tokens.to}
            value={values.to}
            switchToUSD={switchToUSD.to}
            networkFeeUSD={networkFeeUSD}
            approx={lastEdited === "from"}
            onSwitchToUSD={handleSwitchToUSD("to")}
            onClick={createTokenClickHandle("to")}
            onChange={handleTokenValueChange("to")}
          />
        </Stack>
        <Stack flexGrow={1} rowGap={1.5} mt="17px" mx={2}>
          {availableGaslessSwapping && (
            <Stack mt={0.5} columnGap={0.25} direction="row" alignItems="center">
              <InfoTooltip placement="right-start">
                <Stack rowGap={0.5}>
                  <Typography variant="medium">
                    Currently in public beta testing. If you experience any issues, please contact our support.
                  </Typography>
                  <Typography variant="medium">
                    Gasless swaps allow you to trade ANY ERC20 token for another without using {network?.name} to cover the network fee.
                    Instead, the fee comes from the ERC20 token you&apos;re swapping. Network fees can change often and while your
                    transaction is processing, so you might receive a small amount of {network?.currencySymbol} along with the new token you
                    swapped to.
                  </Typography>
                  <Typography variant="medium">
                    Keep in mind that gasless swaps could be more expensive than regular swaps, as they involve several combined
                    transactions. However, they offer some advantages, like being decentralized and often cheaper than buying Ethereum
                    through centralized services to top up your wallet. Gasless swaps also help protect against frontrunning bots by
                    submitting them privately to the blockchain.
                  </Typography>
                  <Link
                    variant="medium"
                    mt={0.5}
                    href="https://docs.getaurox.com/product-docs/aurox-wallet-guides/gasless-swaps"
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                  >
                    Learn more
                  </Link>
                </Stack>
              </InfoTooltip>
              <Typography component="span" variant="medium">
                Gasless (beta)
              </Typography>
              <Checkbox sx={sxStyles.checkbox} checked={enabledGaslessSwapping} onChange={toggleGaslessSwapping} />
            </Stack>
          )}

          <Divider variant="fullWidth" />

          <SwapSlippage slippage={slippage} onSlippageChange={handleSlippageChange} inPreview={false} />

          {tokens.from && (
            <NetworkFee
              mt={0}
              gasless={gasless}
              token={tokens.from}
              feeManager={feeManager}
              title="Max Network Fee:"
              infoIconPosition="prefix"
              networkIdentifier={tokens.from.networkIdentifier}
              infoText="This is not a fee charged by Aurox. This is the maximum fee you are willing to pay blockchain validators to process your transaction."
            />
          )}

          {fromTokenExceeds25PercentOfSwap && (
            <Box mt="auto">
              <AlertStatus warning warningText="Cost of the swap is more than 25% of the total swap amount" />
            </Box>
          )}
          {!showApproval && <ErrorText error={getError()} mt="auto" justifyContent="center" disableSpaceReservation />}
        </Stack>
      </Stack>

      <FixedPanel variant="bottom" disablePortal display="flex" p={2}>
        {showApproval && (
          <LoadingButton fullWidth variant="contained" loading={approving} disabled={!!approvalError} onClick={handleApproveToken}>
            Approve Aurox to Swap your {tokens.from?.symbol}
          </LoadingButton>
        )}
        {!showApproval && (
          <LoadingButton
            fullWidth
            variant="contained"
            disabled={!!getError() || !swapEnabled || swapNetworkFeeUSD === 0}
            loading={loading || approving}
            onClick={handleGoToPreview}
          >
            Preview
          </LoadingButton>
        )}
      </FixedPanel>

      {direction && (
        <TokenSelectModal
          direction={direction}
          onClose={handleCloseTokenModal}
          onTokenSelect={handleTokenSelect}
          selectedTokenKey={direction === "from" ? tokens.from?.key : tokens.to?.key}
          excludeTokenKey={direction === "from" ? tokens.to?.key : tokens.from?.key}
          selectedNetworkIdentifier={direction === "to" ? tokens.from?.networkIdentifier : null}
        />
      )}
      {openModal === "wait-approval" && (
        <WaitingApprovalModal onOk={handleWaitingApprovalModalClose} onClose={handleWaitingApprovalModalClose} />
      )}
    </>
  );
});
