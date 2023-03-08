import { MouseEvent, useState } from "react";

import { ethers } from "ethers";

import { Box, Typography, Link, ListItemText, Stack } from "@mui/material";

import { createAssetKey, getAssetIdentifierFromDefinition } from "common/utils";
import { DApp as DAppEvents } from "common/events";
import { Operation } from "common/types";

import {
  useAccountByUUID,
  useContractStatus,
  useLocalUserPreferences,
  useNetworkBlockchainExplorerLinkResolver,
  useTokenAssetTicker,
  useTokenBalance,
  useTokenInformation,
} from "ui/hooks";

import TokenContractInfo from "ui/components/entity/token/TokenContractInfo";
import ContractAlertStatus from "ui/components/common/ContractAlertStatus";

import { ERC20Approval } from "ui/common/tokens";

import { formatValueFromAmountAndPrice } from "ui/common/utils";

import TransactionPageWrapper from "ui/components/flows/transaction/TransactionPageWrapper";

import { DEFAULT_DECIMALS, networkNativeCurrencyData } from "common/config";

import NetworkFeeV2 from "ui/components/flows/feeSelection/NetworkFeeV2";

import { useTransactionManager } from "ui/hooks/rpc";

import ErrorText from "ui/components/form/ErrorText";

import AlertStatus from "ui/components/common/AlertStatus";

import EditTokenAmountModal from "./EditTokenAmountModal";

export interface TokenApprovalProps {
  operation: Operation & { operationType: "transact" };

  approval: ERC20Approval;
}

export default function TokenApproval(props: TokenApprovalProps) {
  const { operation, approval } = props;

  const [submitting, setSubmitting] = useState(false);

  const modifiedOperation = { ...operation, transactionPayload: approval.transaction };

  const [notification, setNotification] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [isEditAmountModalOpen, setIsEditAmountModalOpen] = useState(false);

  const [approvalAmount, setApprovalAmount] = useState(0);

  const { status } = useContractStatus(approval.tokenAddress, operation.networkIdentifier);

  const { tokenInformation } = useTokenInformation(approval.tokenAddress, operation.networkIdentifier);
  const { tokenBalance } = useTokenBalance(approval.tokenAddress, operation.networkIdentifier, approval.senderAddress);

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(operation.networkIdentifier);

  const accountBalance = ethers.utils.formatUnits(tokenBalance, tokenInformation?.decimals ?? DEFAULT_DECIMALS);

  const account = useAccountByUUID(operation.accountUUID);

  const nativeCurrencySymbol = networkNativeCurrencyData[operation.networkIdentifier]?.symbol ?? "ETH";

  const transactionManager = useTransactionManager(account, operation.networkIdentifier, approval.transaction);

  // TODO: needs resilient to price not being available @nikola
  const assetIdentifier = getAssetIdentifierFromDefinition({
    type: "contract",
    contractType: "ERC20",
    contractAddress: operation.transactionPayload.to,
  });

  const assetKey = createAssetKey(operation.networkIdentifier, assetIdentifier);

  const ticker = useTokenAssetTicker(assetKey);

  const [userPreferences] = useLocalUserPreferences();

  const submitTransaction = async () => {
    if (!transactionManager || submitting) return;

    setSubmitting(true);

    setError("");

    if (account?.type === "hardware") {
      setNotification(`Check your ${account.hardwareType} device`);
    }

    try {
      await transactionManager.sendTransaction(operation.id, {
        message: `Approve ${tokenInformation?.name}`,
        blockExplorerTxBaseURL: getTransactionExplorerLink(""),
      });

      DAppEvents.TransactionRequestResponded.broadcast(operation.id, transactionManager.transactionHash);
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

  const changeAmount = (amount: number) => {
    const newAmount = ethers.utils.parseUnits(amount.toString(), tokenInformation?.decimals ?? DEFAULT_DECIMALS);

    approval.updateAmount(newAmount);

    setApprovalAmount(amount);
    setIsEditAmountModalOpen(false);
  };

  const onEditAmountClick = (event: MouseEvent) => {
    event.preventDefault();
    setIsEditAmountModalOpen(true);
  };

  const getEditableAmount = () => {
    const requestedAmount = approval.isInfinite
      ? "Infinite"
      : ethers.utils.formatUnits(approval.amount, tokenInformation?.decimals ?? DEFAULT_DECIMALS);

    const primary = (
      <Box display="flex" alignItems="center">
        <Typography mr={0.5}>
          Amount: {requestedAmount} {tokenInformation?.symbol}
        </Typography>
        <Link href="#" underline="hover" onClick={onEditAmountClick}>
          Edit
        </Link>
      </Box>
    );

    const price = Number(ticker.priceUSD);

    if (price && !approval.isInfinite) {
      const amount = Number(requestedAmount);

      const totalPrice = formatValueFromAmountAndPrice(amount, price, "~$");

      return <ListItemText primary={primary} secondary={totalPrice} />;
    }

    return <ListItemText primary={primary} />;
  };

  const contractStatus = userPreferences.security.smartContractMonitoringEnabled ? status : null;

  const requirePassword = contractStatus === "black";

  const hasEnoughFunds = transactionManager?.feeManager?.hasEnoughFunds ?? true;

  return (
    <TransactionPageWrapper
      operation={modifiedOperation}
      requirePassword={requirePassword}
      activeSubmit={!error && hasEnoughFunds && !submitting}
      submitText="Approve"
      handleOnSubmit={submitTransaction}
      errorComponent={<ContractAlertStatus status={contractStatus} />}
    >
      <TokenContractInfo dappUrl={operation.domain} contractAddress={approval.transaction.to} actionType="Approve">
        {getEditableAmount()}
      </TokenContractInfo>
      <NetworkFeeV2 networkIdentifier={operation.networkIdentifier} feeManager={transactionManager?.feeManager ?? null} />
      {!hasEnoughFunds && (
        <ErrorText error={`You do not have enough ${nativeCurrencySymbol} to pay for the network fee`} mt={1} justifyContent="center" />
      )}
      <EditTokenAmountModal
        fullWidth
        show={isEditAmountModalOpen}
        symbol={tokenInformation?.symbol ?? ""}
        amount={approvalAmount}
        price={Number(ticker?.priceUSD)}
        balance={Number(accountBalance)}
        decimals={tokenInformation?.decimals ?? DEFAULT_DECIMALS}
        onConfirm={changeAmount}
        onCancel={() => setIsEditAmountModalOpen(false)}
      />
      {notification && (
        <Stack mt={1}>
          <AlertStatus info infoText={notification} />
        </Stack>
      )}
    </TransactionPageWrapper>
  );
}
