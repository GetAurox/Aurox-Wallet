import { memo, useState } from "react";

import { Box, Stack } from "@mui/material";

import { DApp as DAppEvents } from "common/events";
import { Operation } from "common/types";
import { decodeTransaction } from "common/utils";
import { networkNativeCurrencyData } from "common/config";

import { useGoHome } from "ui/common/history";
import {
  useNetworkByIdentifier,
  useContractStatus,
  useLocalUserPreferences,
  useAccountByUUID,
  useNetworkBlockchainExplorerLinkResolver,
} from "ui/hooks";

import TokenContractInfo from "ui/components/entity/token/TokenContractInfo";
import ContractAlertStatus from "ui/components/common/ContractAlertStatus";
import Success from "ui/components/layout/misc/Success";

import AlertStatus from "ui/components/common/AlertStatus";

import TransactionPageWrapper from "ui/components/flows/transaction/TransactionPageWrapper";
import NetworkFee from "ui/components/flows/feeSelection/NetworkFee";
import { useTransactionManager } from "ui/hooks/rpc";
import ErrorText from "ui/components/form/ErrorText";

export interface RegularTransactionProps {
  operation: Operation & { operationType: "transact" };
}

export default memo(function RegularTransaction(props: RegularTransactionProps) {
  const { operation } = props;

  const [notification, setNotification] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const decodedTransaction = decodeTransaction(operation);

  const goHome = useGoHome();

  const network = useNetworkByIdentifier(operation.networkIdentifier);
  const account = useAccountByUUID(operation.accountUUID);

  const nativeCurrencySymbol = networkNativeCurrencyData[operation.networkIdentifier]?.symbol ?? "ETH";

  const { status } = useContractStatus(operation.transactionPayload.to, operation.networkIdentifier);
  const [userPreferences] = useLocalUserPreferences();

  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const transactionManager = useTransactionManager(account, operation.networkIdentifier, operation.transactionPayload);

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(operation.networkIdentifier);

  const handleOnSubmit = async () => {
    if (!transactionManager || submitting) return;

    if (!transactionManager.feeStrategy?.hasEnoughFunds) {
      setError(errorText);
      return;
    }

    setSubmitting(true);

    if (account?.type === "hardware") {
      setNotification(`Check your ${account.hardwareType} device`);
    }

    setError("");

    try {
      const { hash } = await transactionManager.sendTransaction({
        operationId: operation.id,
        message: "DApp Interaction",
        blockExplorerTxBaseURL: getTransactionExplorerLink(""),
      });

      setCompleted(true);

      DAppEvents.TransactionRequestResponded.broadcast(operation.id, hash);
    } catch (error) {
      if (typeof error === "string") {
        setNotification(error);
      } else {
        setNotification(null);
        setError("Failed to submit transaction. Try again?");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const hasEnoughFunds = transactionManager?.feeStrategy?.hasEnoughFunds ?? true;

  const errorText = `You do not have enough ${network?.currencySymbol} to submit this transaction`;
  // TODO: This is currently a bit buggy, simplifying it for my testing purposes
  const activeSubmit = !error && hasEnoughFunds;
  const showPassword = status === "black";

  const contractStatus = userPreferences.security.smartContractMonitoringEnabled ? status : null;

  if (completed) {
    return <Success heading="Complete" subheading="Transaction Successfully Submitted" onButtonClick={goHome} />;
  }

  return (
    <TransactionPageWrapper
      submitText="Submit"
      handleOnSubmit={handleOnSubmit}
      operation={operation}
      activeSubmit={activeSubmit && !submitting}
      requirePassword={showPassword}
      errorComponent={
        contractStatus !== undefined && (
          <Box mt={1.5} mb={1.5}>
            {error && <AlertStatus error errorText={errorText} />}
            {!error && <ContractAlertStatus status={contractStatus} />}
          </Box>
        )
      }
    >
      {operation?.domain && (
        <TokenContractInfo
          dappUrl={operation.domain}
          contractAddress={operation.transactionPayload.to}
          actionType={decodedTransaction?.name ?? "Transaction"}
        />
      )}
      <NetworkFee networkIdentifier={operation.networkIdentifier} feeManager={transactionManager?.feeStrategy ?? null} />
      {!hasEnoughFunds && (
        <ErrorText error={`You do not have enough ${nativeCurrencySymbol} to pay for the network fee`} mt={1} justifyContent="center" />
      )}
      {notification && (
        <Stack mt={1}>
          <AlertStatus info infoText={notification} />
        </Stack>
      )}
    </TransactionPageWrapper>
  );
});
