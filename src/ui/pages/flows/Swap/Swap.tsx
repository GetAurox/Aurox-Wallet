import { useCallback, useEffect, useMemo, useReducer } from "react";
import produce from "immer";

import { Typography } from "@mui/material";

import { EVMTransactions, Wallet } from "common/operations";
import { Pair, SwapDetails, getSlippageValueFromToleranceType } from "common/wallet";
import { ethereumMainnetNetworkIdentifier, proxySwapAddressMapping } from "common/config";
import { EVMTransactionStatus, TokenSwapSlippageTolerance, TransactionRequest } from "common/types";

import useAnalytics from "ui/common/analytics";
import { useRewardSystemContext } from "ui/common/rewardSystem";
import { useHistoryReset, useHistoryState } from "ui/common/history";

import {
  useActiveAccount,
  useDebounce,
  useDeepMemo,
  useGaslessTransactionInformation,
  useNativeTokenMarketTicker,
  useNetworkByIdentifier,
  useStages,
  useTimeCounter,
  useTokenSwap,
} from "ui/hooks";
import { useEVMTransactions } from "ui/hooks/states/evmTransactions";

import SuccessView from "ui/components/layout/misc/Success";
import FailView from "ui/components/layout/misc/FailView";

import { bothTransactionsNeedSigning, getTokenSwapDetails, isSomeTransactionPending, oneTransactionSigned } from "./helpers";

import PreviewView from "./PreviewView";
import PendingView from "./PendingView";
import InitialView, { type Amount } from "./InitialView";
import { defaultSlippageTolerance } from "./SwapSlippage";
import { useSwapTokenPairTickers } from "./useTokenPairTickers";
import { ConfirmCancelSwapModal } from "./ConfirmCancelSwapModal";

type Stage = typeof stages[number];

export type Exchange = SwapDetails & { amounts: Pair<Amount> } & { swapContract: string };

export type ExchangeState = {
  gasless: boolean;
  swapContract: string;
  slippage: TokenSwapSlippageTolerance;
  values: Pair<{ amount: Amount; currency: Amount }>;
};

const stages = ["initial", "pending", "preview", "completed"] as const;

export const defaultExchange: ExchangeState = {
  gasless: false,
  swapContract: "",
  slippage: defaultSlippageTolerance,
  values: { from: { amount: "", currency: "" }, to: { amount: "", currency: "" } },
};

interface SwapState {
  gasless: boolean;
  swapContract: string;
  swapTransactionHash: string;
  approvalError?: string | null;
  approvalTransactionHash: string;
  slippage: TokenSwapSlippageTolerance;
  values: typeof defaultExchange.values;
  warningModalOpen: boolean;
  swapError?: string | null;
  hwSwapSubmitted?: boolean;
}

type SwapAction =
  | {
      type: "SET_SWAP_TRANSACTION_HASH";
      payload: SwapState["swapTransactionHash"];
    }
  | {
      type: "SET_APPROVAL_TRANSACTION_HASH";
      payload: SwapState["approvalTransactionHash"];
    }
  | {
      type: "SET_VALUES";
      payload: SwapState["values"];
    }
  | {
      type: "SET_APPROVAL_ERROR";
      payload: SwapState["approvalError"];
    }
  | {
      type: "SET_EXCHANGE";
      payload: Partial<ExchangeState>;
    }
  | {
      type: "SET_WARNING_MODAL_OPEN";
      payload: SwapState["warningModalOpen"];
    }
  | {
      type: "SET_SWAP_ERROR";
      payload: SwapState["swapError"];
    }
  | {
      type: "SET_HW_SWAP_SUBMITTED";
      payload: SwapState["hwSwapSubmitted"];
    };

const reducer = produce((draft: SwapState, action: SwapAction) => {
  switch (action.type) {
    case "SET_SWAP_TRANSACTION_HASH":
      draft.swapTransactionHash = action.payload;
      break;
    case "SET_APPROVAL_TRANSACTION_HASH":
      draft.approvalTransactionHash = action.payload;
      break;
    case "SET_VALUES":
      draft.values = action.payload;
      break;
    case "SET_APPROVAL_ERROR":
      draft.approvalError = action.payload;
      break;
    case "SET_EXCHANGE":
      draft.values = action.payload.values ?? draft.values;
      draft.gasless = action.payload.gasless ?? draft.gasless;
      draft.slippage = action.payload.slippage ?? draft.slippage;
      draft.swapContract = action.payload.swapContract ?? draft.swapContract;
      break;
    case "SET_WARNING_MODAL_OPEN":
      draft.warningModalOpen = action.payload;
      break;
    case "SET_SWAP_ERROR":
      draft.swapError = action.payload;
      break;
    case "SET_HW_SWAP_SUBMITTED":
      draft.hwSwapSubmitted = action.payload;
      break;
    default:
      throw new Error("Invalid action type");
  }
});

export default function Swap() {
  const initialState: SwapState = {
    approvalError: null,
    swapTransactionHash: "",
    approvalTransactionHash: "",
    warningModalOpen: false,
    ...defaultExchange,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const { stage, setStage } = useStages<Stage>(stages);
  const { set, timeLeft } = useTimeCounter();

  const reset = useHistoryReset();

  const { trackButtonClicked } = useAnalytics();

  const activeAccount = useActiveAccount();

  const [fromTokenKey] = useHistoryState("fromTokenKey", "");
  const [toTokenKey] = useHistoryState("toTokenKey", "");

  const { publish } = useRewardSystemContext();

  const { from: fromToken, to: toToken } = useSwapTokenPairTickers({ from: fromTokenKey, to: toTokenKey });

  const network = useNetworkByIdentifier(fromToken?.networkIdentifier || ethereumMainnetNetworkIdentifier);

  const transactions = useEVMTransactions();

  const swapTxKey = `${activeAccount?.uuid}||${fromToken?.networkIdentifier}||${state.swapTransactionHash}`;
  const approvalTxKey = `${activeAccount?.uuid}||${fromToken?.networkIdentifier}||${state.swapTransactionHash}`;

  const swapTransaction = transactions?.[swapTxKey];
  const approvalTransaction = transactions?.[approvalTxKey];

  const nativeTicker = useNativeTokenMarketTicker(fromToken?.networkIdentifier || ethereumMainnetNetworkIdentifier, {
    throttleMaxWait: 10000,
  });
  const gaslessTransactionInfo = useGaslessTransactionInformation();
  const isHardwareWallet = activeAccount?.type === "hardware";

  const swapToToken = getTokenSwapDetails(toToken);
  const swapFromToken = getTokenSwapDetails(fromToken);

  const memoizedSwapToToken = useDeepMemo(swapToToken);
  const memoizedSwapFromToken = useDeepMemo(swapFromToken);

  const exchange = useMemo(
    () => ({
      gasless: state.gasless,
      swapContract: state.swapContract,
      slippage: getSlippageValueFromToleranceType(state.slippage),
      amounts: {
        from: state.values.from.amount,
        to: state.values.to.amount,
      },
      tokens: { from: memoizedSwapFromToken, to: memoizedSwapToToken },
    }),
    [
      state.gasless,
      state.swapContract,
      state.slippage,
      state.values.from.amount,
      state.values.to.amount,
      memoizedSwapFromToken,
      memoizedSwapToToken,
    ],
  );

  const debouncedExchange = useDebounce(exchange, 1000);

  const { approvalService, swapService, error, loading } = useTokenSwap(debouncedExchange);

  const needsApproval = !!approvalService;

  const approvalNetworkFeeUSD = needsApproval
    ? (approvalService?.feeStrategy?.feePriceInNativeCurrency ?? 0) * Number(nativeTicker?.priceUSD ?? 0)
    : 0;

  const swapNetworkFeeUSD = (swapService?.feeStrategy?.feePriceInNativeCurrency ?? 0) * Number(nativeTicker?.priceUSD ?? 0);

  const handleExchangeChange = useCallback(
    async (exchange: Partial<ExchangeState>) => {
      const chainId = fromToken?.networkDefinition?.chainId;

      const swapContract = chainId ? proxySwapAddressMapping[chainId] : "";

      const newSwapContract = exchange.swapContract ?? swapContract;

      dispatch({ type: "SET_EXCHANGE", payload: { ...exchange, swapContract: newSwapContract } });
    },
    [fromToken?.networkDefinition?.chainId],
  );

  const handleSendApproval = useCallback(async () => {
    if (!approvalService) {
      throw new Error("Approval manager is not configured properly");
    }

    try {
      const { hash, waitForReceipt, getTransactionStatus } = await approvalService.sendTransaction();

      await waitForReceipt();

      const status = await getTransactionStatus();

      if (status === EVMTransactionStatus.Completed) {
        dispatch({ type: "SET_APPROVAL_ERROR", payload: null });

        if (hash) {
          dispatch({ type: "SET_APPROVAL_TRANSACTION_HASH", payload: hash });

          await handleExchangeChange(exchange);
        }
      }
    } catch (error) {
      console.error(error);

      dispatch({ type: "SET_APPROVAL_ERROR", payload: error });
    }
  }, [approvalService, exchange, handleExchangeChange]);

  const handleRequestSwap = () => {
    if (!fromToken || !toToken) {
      throw new Error("Can not continue to the next phase, tokens are not selected");
    }

    if (!state.values.from.amount || !state.values.to.amount) {
      throw new Error("Can not continue to the next phase, amounts are not set");
    }

    setStage("preview");
  };

  const handleConfirmSwap = useCallback(async () => {
    const sendSwap = async () => {
      if (!swapService) {
        throw new Error("Swap manager is not configured properly");
      }

      if (!fromToken?.networkIdentifier || !activeAccount?.uuid) {
        return;
      }

      let hash = "";

      if (state.gasless) {
        hash = await EVMTransactions.SendEVMTransactionGasless.perform({
          networkIdentifier: fromToken?.networkIdentifier,
          accountUUID: activeAccount?.uuid,
          swapTransaction: swapService.feeStrategy.transaction as TransactionRequest,
          approvalTransaction: needsApproval ? (approvalService?.feeStrategy.transaction as TransactionRequest) : undefined,
        });

        trackButtonClicked("Gasless Swap");
      } else {
        hash = (await swapService.sendTransaction()).hash;

        trackButtonClicked("Regular Swap");
      }

      if (hash) {
        dispatch({ type: "SET_SWAP_TRANSACTION_HASH", payload: hash });

        const signature = await Wallet.SignMessageV2.perform({
          chainType: "evm",
          message: hash,
          uuid: activeAccount.uuid,
          shouldArrayify: true,
        });

        publish("aurox.my.token_transaction", [], {
          hash,
          signature,
          ...(fromToken && { chain_id: fromToken.networkDefinition?.chainId }),
        });

        setStage("completed");
        dispatch({ type: "SET_HW_SWAP_SUBMITTED", payload: false });
      }
    };

    setStage("pending");
    set(2);

    try {
      await sendSwap();
    } catch (error) {
      console.error(error);

      dispatch({ type: "SET_SWAP_ERROR", payload: error.message });
    }
  }, [
    setStage,
    set,
    swapService,
    fromToken,
    activeAccount?.uuid,
    state.gasless,
    needsApproval,
    approvalService?.feeStrategy.transaction,
    trackButtonClicked,
    publish,
  ]);

  const handleErrorClose = () => {
    setStage("initial");
    dispatch({ type: "SET_SWAP_ERROR", payload: "" });
  };

  const handleCancelSwap = () => {
    dispatch({ type: "SET_WARNING_MODAL_OPEN", payload: true });
  };

  const handleCancelSwapConfirm = () => {
    EVMTransactions.CancelEVMTransactionGasless.perform();
    dispatch({ type: "SET_WARNING_MODAL_OPEN", payload: false });
    dispatch({ type: "SET_SWAP_TRANSACTION_HASH", payload: "" });
    dispatch({ type: "SET_APPROVAL_TRANSACTION_HASH", payload: "" });
    setStage("initial");
  };

  const handleBackToInitial = () => {
    setStage("initial");
  };

  const handleViewTransaction = () => {
    reset(`/transactions/${state.swapTransactionHash}/details`);
  };

  // useEffect(() => {
  //   if (
  //     isHardwareWallet &&
  //     !state.hwSwapSubmitted &&
  //     stage === "pending" &&
  //     gaslessTransactionInfo?.swapTransactionSigned &&
  //     gaslessTransactionInfo?.approvalTransactionSigned
  //   ) {
  //     handleConfirmSwap();
  //     dispatch({ type: "SET_HW_SWAP_SUBMITTED", payload: true });
  //   }
  // }, [
  //   gaslessTransactionInfo?.approvalTransactionSigned,
  //   gaslessTransactionInfo?.swapTransactionSigned,
  //   handleConfirmSwap,
  //   isHardwareWallet,
  //   stage,
  //   state.hwSwapSubmitted,
  // ]);

  if (state.swapError) {
    return (
      <FailView
        heading={state.gasless ? "Gasless swap failed to execute" : "Swap Failed"}
        subheading={"Please try again.\nContact support if problem persists."}
        onButtonClick={handleErrorClose}
      />
    );
  }

  if (stage === "pending" && !isHardwareWallet && timeLeft > 0) {
    return <PendingView heading={state.gasless ? "Submitting Gasless Swap" : "Submitting Swap"} />;
  }

  // if (stage === "pending" && isHardwareWallet && needsApproval && bothTransactionsNeedSigning(gaslessTransactionInfo)) {
  //   return (
  //     <>
  //       <PendingView
  //         heading="Please use your hardware wallet to sign the transaction (1/2)"
  //         buttonLabel="Cancel"
  //         onButtonClick={handleCancelSwap}
  //         subheading={
  //           <>
  //             Gasless Swaps can require{" "}
  //             <Typography fontWeight={500} color="text.primary" component="span">
  //               2 signatures
  //             </Typography>
  //             .{" "}
  //             <Typography fontWeight={500} color="text.primary" component="span">
  //               Waiting for 1st
  //             </Typography>{" "}
  //             Hardware Wallet signature
  //           </>
  //         }
  //       />
  //       <ConfirmCancelSwapModal open={state.warningModalOpen} onCancel={handleCancelSwapConfirm} />
  //     </>
  //   );
  // }

  // if (stage === "pending" && isHardwareWallet && needsApproval && oneTransactionSigned(gaslessTransactionInfo)) {
  //   return (
  //     <>
  //       <PendingView
  //         heading="Please use your hardware wallet to sign the transaction (2/2)"
  //         buttonLabel="Cancel"
  //         onButtonClick={handleCancelSwap}
  //         subheading={
  //           <>
  //             Gasless Swaps can require{" "}
  //             <Typography fontWeight={500} color="text.primary" component="span">
  //               2 signatures
  //             </Typography>
  //             .{" "}
  //             <Typography fontWeight={500} color="text.primary" component="span">
  //               Waiting for 2nd
  //             </Typography>{" "}
  //             Hardware Wallet signature
  //           </>
  //         }
  //       />
  //       <ConfirmCancelSwapModal open={state.warningModalOpen} onCancel={handleCancelSwapConfirm} />
  //     </>
  //   );
  // }

  // if (
  //   stage === "pending" &&
  //   isHardwareWallet &&
  //   (isSomeTransactionPending([swapTransaction, approvalTransaction]) ||
  //     (!needsApproval && bothTransactionsNeedSigning(gaslessTransactionInfo)))
  // ) {
  //   return (
  //     <>
  //       <PendingView
  //         buttonLabel="Cancel"
  //         onButtonClick={handleCancelSwap}
  //         heading="Please use your hardware wallet to sign the transaction"
  //         subheading="Waiting for Hardware Wallet confirmation"
  //       />
  //       <ConfirmCancelSwapModal open={state.warningModalOpen} onCancel={handleCancelSwapConfirm} />
  //     </>
  //   );
  // }

  if (stage === "pending" && state.gasless && isSomeTransactionPending([swapTransaction, approvalTransaction])) {
    return (
      <PendingView
        buttonLabel="View Transaction"
        heading="Waiting For Confirmation"
        onButtonClick={handleViewTransaction}
        subheading={`It can take up to 5 minutes for the transaction to show up on ${network?.chainExplorer?.name}`}
      />
    );
  }

  if (stage === "initial") {
    return (
      <InitialView
        loading={loading}
        swapError={error}
        network={network}
        values={state.values}
        gasless={state.gasless}
        tokens={{ to: toToken, from: fromToken }}
        slippage={state.slippage}
        needsApproval={needsApproval}
        requestSwap={handleRequestSwap}
        sendApproval={handleSendApproval}
        onExchangeChange={handleExchangeChange}
        swapNetworkFeeUSD={swapNetworkFeeUSD}
        approvalNetworkFeeUSD={approvalNetworkFeeUSD}
        hasEnoughFunds={!!swapService?.feeStrategy?.hasEnoughFunds}
        feeManager={approvalService?.feeStrategy ?? swapService?.feeStrategy ?? null}
        approvalError={(state.approvalError || approvalService?.feeStrategy?.error) ?? ""}
      />
    );
  }

  if (stage === "preview" && toToken && fromToken) {
    return (
      <PreviewView
        gasless={state.gasless}
        slippage={state.slippage}
        loading={timeLeft > 0}
        onBackClick={handleBackToInitial}
        onConfirmSwap={handleConfirmSwap}
        tokens={{ to: toToken, from: fromToken }}
        networkFeeUSD={approvalNetworkFeeUSD + swapNetworkFeeUSD}
        amounts={{ from: state.values.from.amount, to: state.values.to.amount }}
        feeManager={approvalService?.feeStrategy ?? swapService?.feeStrategy ?? null}
      />
    );
  }

  if (stage === "completed") {
    return (
      <SuccessView
        buttonLabel="View Transaction"
        onButtonClick={handleViewTransaction}
        heading={state.gasless ? "Gasless Swap Completed" : "Swap Completed"}
      />
    );
  }

  return <></>;
}
