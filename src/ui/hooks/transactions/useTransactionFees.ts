import { useCallback, useEffect, useState } from "react";
import produce from "immer";

import { ProviderManager, FormattedTransactionData, EVMProvider, getTransactionDetailsWithEstimate } from "common/wallet";
import { AccountInfo, BlockchainNetwork, TransactionPayload, TransactionRequest } from "common/types";
import { TRANSACTION_FEE_REFRESH_INTERVAL } from "common/config";

import { OmitAuxillaryTransactionProps, EthereumAccountTransaction, EthereumContractMethod, TokenTicker } from "ui/types";
import { FeeConfiguration, FeePreference, defaultFeePreference, getUpdatedFeeConfiguration } from "ui/common/fee";
import { PopupSignerManager } from "ui/common/connections";

import { useNativeTokenImperativeTickers } from "../tickers";

type EstimateStatus = "estimate" | "confirm";

export interface TransactionDataState {
  payload: TransactionPayload;
  details: OmitAuxillaryTransactionProps<EthereumAccountTransaction> & { method: EthereumContractMethod };
  network: BlockchainNetwork;
  accountInfo: AccountInfo;
  feeConfiguration: FeeConfiguration;
  estimateStatus: EstimateStatus;
}

type Response<T> = { success: false; error: string } | { success: true; result: T };

type UpdateTransactionDataResponse = Response<TransactionDataState>;

interface TransactionResponse {
  hash: string;
}

type SendTransactionResponse = Response<TransactionResponse>;

async function getFeeState(
  network: BlockchainNetwork,
  payload: TransactionPayload,
  preference: FeePreference,
  nativeAssetTicker?: TokenTicker,
  overrideFields?: { gasLimit: boolean },
): Promise<FeeConfiguration> {
  if (payload.type !== "evm") {
    throw new Error("Missing fee state implementation");
  }

  const provider = ProviderManager.getProvider(network) as EVMProvider;

  const feeData = await provider.getNetworkFeeData();

  let gasLimit: string;
  if (overrideFields?.gasLimit) {
    gasLimit = (await provider.provider.estimateGas(payload.params)).toString();
  } else {
    gasLimit = payload.params.gasLimit;
  }

  return getUpdatedFeeConfiguration(
    {
      gasLimit,
      preference,
      baseFee: feeData.baseFee,
    },
    preference,
    nativeAssetTicker,
  );
}

function updateTransactionWithFee(transaction: TransactionRequest, feeConfiguration: FeeConfiguration): TransactionRequest {
  return {
    ...transaction,
    maxFeePerGas: feeConfiguration.maxFeePerGas,
    maxPriorityFeePerGas: feeConfiguration.maxPriorityFeePerGas,
  };
}

export interface UseTransactionFeeProps {
  disableRefetch?: boolean;
  refetchInterval?: number;
}

export function useTransactionFees(props?: UseTransactionFeeProps) {
  const [transactionData, setStateTransactionData] = useState<TransactionDataState | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userUpdatedFeeFields, setUserUpdatedFeeFields] = useState(false);

  const getImperativeTicker = useNativeTokenImperativeTickers();

  const updateTransactionData = useCallback(
    async (
      newTransactionDetails: OmitAuxillaryTransactionProps<EthereumAccountTransaction>,
      formattedTransactionData: FormattedTransactionData,
      accountInfo: AccountInfo,
      network: BlockchainNetwork,
      estimateStatus: EstimateStatus,
    ): Promise<UpdateTransactionDataResponse> => {
      try {
        const signer = PopupSignerManager.getSigner(accountInfo, network);

        const populatedTx = (await signer.populateTransaction(
          // TODO: will re-address this cast to any when we add other chainTypes
          formattedTransactionData.params.transactionData as any,
        )) as TransactionRequest;

        const feeConfiguration = await getFeeState(
          network,
          { type: "evm", params: populatedTx },
          transactionData?.feeConfiguration.preference ?? defaultFeePreference,
          getImperativeTicker(network.identifier),
        );

        const newTransactionData: TransactionDataState = {
          details: {
            ...newTransactionDetails,
            method: formattedTransactionData.params.method,
          },
          network: network,
          accountInfo,
          estimateStatus,
          feeConfiguration,
          payload: {
            type: "evm",
            params: updateTransactionWithFee(populatedTx, feeConfiguration),
          },
        };

        setStateTransactionData(newTransactionData);

        return {
          success: true,
          result: newTransactionData,
        };
      } catch (e) {
        const errorMessage = e?.message ?? "Failed to get transaction data";

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [getImperativeTicker, transactionData?.feeConfiguration.preference],
  );

  const sendTransaction = async (): Promise<SendTransactionResponse> => {
    if (!transactionData) throw new Error("Missing required details to send transaction");

    // Additional security around sending the transaction to catch any bugs around producing the gas/cost estimates
    if (transactionData.estimateStatus === "estimate") throw new Error("Transaction data still in estimating mode");

    const { network, accountInfo } = transactionData;

    if (network.chainType !== "evm") throw new Error("Missing implementation");

    const signer = PopupSignerManager.getSigner(accountInfo, network);

    const presendDetails = getTransactionDetailsWithEstimate({
      type: network.chainType,
      details: transactionData.details,
      request: transactionData.payload.params as TransactionRequest,
    });

    try {
      // TODO: re-address this cast to any when we add the next chain
      const transactionResponse = await signer.sendTransactionWithDetails(transactionData.payload.params as any, presendDetails);

      return {
        success: true,
        result: transactionResponse,
      };
    } catch (e) {
      const errorMessage = e?.message ?? "Failed to get transaction data";

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const clearTransactionFeeState = useCallback(() => {
    setStateTransactionData(null);
  }, []);

  const setFee = (newConfiguration: FeeConfiguration) => {
    setStateTransactionData(
      produce(draft => {
        if (!draft) return null;

        if (
          newConfiguration.maxFeePerGas !== draft.feeConfiguration.maxFeePerGas ||
          newConfiguration.maxPriorityFeePerGas !== draft.feeConfiguration.maxPriorityFeePerGas ||
          newConfiguration.gasLimit !== draft.feeConfiguration.gasLimit
        ) {
          setUserUpdatedFeeFields(true);
        }

        draft.payload.params = updateTransactionWithFee(draft.payload.params as TransactionRequest, newConfiguration);
        draft.feeConfiguration = newConfiguration;
      }),
    );
  };

  useEffect(() => {
    if (!transactionData) return;

    let mounted = true;
    let intervalId: number;

    const fetch = async () => {
      try {
        setIsUpdating(true);

        const feeConfiguration = await getFeeState(
          transactionData.network,
          transactionData.payload,
          transactionData?.feeConfiguration.preference ?? defaultFeePreference,
          getImperativeTicker(transactionData.network.identifier),
          { gasLimit: true },
        );

        const newTransactionData: TransactionDataState = {
          ...transactionData,
          feeConfiguration,
          payload: {
            type: "evm",
            params: updateTransactionWithFee(transactionData.payload.params as TransactionRequest, feeConfiguration),
          },
        };

        if (mounted) {
          setStateTransactionData(newTransactionData);
          setError(null);
        }
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setIsUpdating(false);
      }
    };

    if (mounted && !userUpdatedFeeFields && !props?.disableRefetch) {
      const refetch: number = props?.refetchInterval ?? TRANSACTION_FEE_REFRESH_INTERVAL;
      intervalId = window.setInterval(fetch, refetch);
    }

    return () => {
      mounted = false;

      window.clearInterval(intervalId);
    };
  }, [getImperativeTicker, props, transactionData, userUpdatedFeeFields]);

  return { setFee, transactionData, updateTransactionData, error, isUpdating, sendTransaction, clearTransactionFeeState };
}
