import { ethers } from "ethers";
import { useState, useEffect, useCallback } from "react";
import Decimal from "decimal.js";

import { getAccountAddressForChainType, getUNSDomainRecordTypeFromTokenDisplay } from "common/utils";
import { RawTransaction } from "common/types";
import { Wallet } from "common/operations";

import useAnalytics from "ui/common/analytics";
import { getEVMTokenTransfer } from "ui/common/tokens";
import { isEthereumAddress } from "ui/common/validators";
import { useRewardSystemContext } from "ui/common/rewardSystem";
import { useHistoryGoBack, useHistoryReset, useHistoryState } from "ui/common/history";
import {
  useActiveAccount,
  useNetworkByIdentifier,
  useAssertBalancesSynchronizedForAssets,
  useIsSufficientFundsForTransaction,
  useTokenAssetDisplay,
  useDebounce,
  useNSResolveAddressFromDomain,
  useNSResolveDomainFromAddress,
  useNetworkBlockchainExplorerLinkResolver,
} from "ui/hooks";
import { useTransactionManager } from "ui/hooks/rpc";

import Success from "ui/components/layout/misc/Success";
import Header from "ui/components/layout/misc/Header";

import StageSetup from "./StageSetup";
import StagePreview from "./StagePreview";
import StageWarning from "./StageWarning";
import { useSendTokenAssetTicker } from "./useSendTokenAssetTicker";

export function Send() {
  const [stage, setStage] = useState<"setup" | "preview" | "warning" | "completed">("setup");

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  // const [memo, setMemo] = useState("");
  const [transaction, setTransaction] = useState<RawTransaction | null>(null);
  const [txHash, setTxHash] = useState<string | null>();
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [disableButton, setDisableButton] = useState(false);
  const [contractAsRecipientAccepted, setContractAsRecipientAccepted] = useState(false);

  const reset = useHistoryReset();
  const goBack = useHistoryGoBack();

  const { trackButtonClicked } = useAnalytics();

  const [assetKey, setAssetKey] = useHistoryState<string | null>("assetKey", null);

  const activeAccount = useActiveAccount();

  const selectedToken = useSendTokenAssetTicker(assetKey);

  const selectedTokenNetwork = useNetworkByIdentifier(selectedToken?.networkIdentifier);

  const transactionManager = useTransactionManager(activeAccount, selectedToken?.networkIdentifier ?? null, transaction);

  useAssertBalancesSynchronizedForAssets(assetKey);

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(selectedToken?.networkIdentifier);

  const { publish } = useRewardSystemContext();

  const normalizedAmount = !amount.trim() ? "0" : amount;

  const isSufficientFundsForTransaction = useIsSufficientFundsForTransaction({
    token: useTokenAssetDisplay(assetKey),
    amount: normalizedAmount,
    feeSettings: transactionManager?.feeStrategy?.feeSettingsForEthereum ?? null,
  });

  const normalizedBalance = !selectedToken?.balance ? "0" : selectedToken.balance;
  const exceedsBalance = selectedToken ? new Decimal(normalizedBalance).lessThan(new Decimal(normalizedAmount)) : false;

  const handleShowStageInitial = () => {
    setAssetKey(null);
    goBack();
  };

  const handleShowStageSetup = () => {
    setError(null);

    setStage("setup");
  };

  // Formats the transaction correctly
  const handleShowStagePreview = useCallback(async () => {
    setError(null);

    setStage("preview");
  }, []);

  const handleShowStageWarning = useCallback(() => {
    setStage("warning");
  }, []);

  // Sends off the transaction
  const handleShowStageCompleted = async () => {
    if (!transactionManager || !activeAccount) return;

    setError(null);

    if (activeAccount.type === "hardware") {
      setNotification(`Check your ${activeAccount.hardwareType} device`);
    }

    setDisableButton(true);

    try {
      const { hash } = await transactionManager.sendTransaction({
        message: `Send ${selectedToken?.name}`,
        blockExplorerTxBaseURL: getTransactionExplorerLink(""),
      });

      setTxHash(hash);

      if (activeAccount.type === "hardware") {
        setStage("completed");

        return;
      }

      const signature = await Wallet.SignMessageV2.perform({
        chainType: "evm",
        message: hash,
        uuid: activeAccount.uuid,
        shouldArrayify: true,
      });

      publish("aurox.my.token_transaction", [], {
        hash,
        signature,
        ...(selectedTokenNetwork && { chain_id: selectedTokenNetwork.chainId }),
      });

      trackButtonClicked("Sent Token");

      setStage("completed");
    } catch (error) {
      if (typeof error === "string") {
        setNotification(error);
      } else {
        setNotification("Failed to submit transaction. Try again?");
      }
    } finally {
      setDisableButton(false);
    }
  };

  const handleComplete = () => {
    if (!txHash) throw new Error("Missing txHash");

    return reset(`/transactions/${txHash}/details`);
  };

  const handleRecipientChange = useCallback((newRecipient: string) => {
    setRecipient(newRecipient);
  }, []);

  const debouncedRecipient = useDebounce(recipient, 300);

  const { loading: resolvingDomain, domain: resolvedDomain } = useNSResolveDomainFromAddress({ address: debouncedRecipient });
  const { loading: resolvingAddress, address: resolvedAddress } = useNSResolveAddressFromDomain({
    unsDomainRecordType: getUNSDomainRecordTypeFromTokenDisplay(selectedToken),
    domain: debouncedRecipient,
  });

  const recipientAddress = resolvedAddress || recipient;

  useEffect(() => {
    const amountDecimal = new Decimal(normalizedAmount);

    if (
      !isEthereumAddress(recipientAddress) ||
      amountDecimal.eq(0) ||
      !selectedToken?.decimals ||
      !selectedToken?.assetDefinition ||
      !activeAccount ||
      !selectedTokenNetwork?.chainType
    ) {
      return;
    }

    const fromAddress = getAccountAddressForChainType(activeAccount, selectedTokenNetwork.chainType);

    const amount = ethers.utils.parseUnits(amountDecimal.toDP(selectedToken.decimals).toFixed(), selectedToken.decimals);

    const transaction = getEVMTokenTransfer({ assetDefinition: selectedToken.assetDefinition, fromAddress, recipientAddress, amount });

    setTransaction(transaction);

    return () => {
      transactionManager?.cancelUpdate?.();
    };
    // Need this to fire only on amount and recipient address change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedAmount, recipientAddress]);

  useEffect(() => {
    setContractAsRecipientAccepted(false);
  }, [recipient]);

  if (stage === "completed") {
    return <Success heading="Complete" subheading="Operation is in progress" buttonDisabled={false} onButtonClick={handleComplete} />;
  }

  let headerTitle = "Send";

  if (selectedToken) {
    headerTitle += ` ${selectedToken.symbol}`;
  } else if (stage === "preview") {
    headerTitle = "Preview";
  }

  let headerBackClick = goBack;

  if (stage === "setup") {
    headerBackClick = handleShowStageInitial;
  } else if (stage === "warning") {
    headerBackClick = handleShowStageSetup;
  } else if (stage === "preview") {
    headerBackClick = handleShowStageSetup;
  }

  const missingRequiredInformation =
    !selectedToken ||
    new Decimal(normalizedAmount).eq(0) ||
    !recipientAddress ||
    !isEthereumAddress(recipientAddress) ||
    !transactionManager?.feeStrategy;

  const notEnoughFunds = !missingRequiredInformation && !isSufficientFundsForTransaction;

  const stepButtonDisabled =
    missingRequiredInformation ||
    exceedsBalance ||
    error !== null ||
    !transactionManager.feeStrategy.hasEnoughFunds ||
    notEnoughFunds ||
    disableButton;

  return (
    <>
      <Header title={headerTitle} onBackClick={headerBackClick} />
      {stage === "setup" && selectedToken && (
        <StageSetup
          selectedToken={selectedToken}
          selectedTokenNetwork={selectedTokenNetwork}
          recipient={recipient}
          onRecipientChange={handleRecipientChange}
          resolvingAddress={resolvingAddress}
          recipientAddress={recipientAddress}
          resolvingDomain={resolvingDomain}
          recipientDomain={resolvedDomain}
          contractAsRecipientAccepted={contractAsRecipientAccepted}
          amount={amount}
          onAmountChange={setAmount}
          exceedsBalance={exceedsBalance}
          feeManager={transactionManager?.feeStrategy ?? null}
          onPreview={handleShowStagePreview}
          onWarning={handleShowStageWarning}
          error={error}
          notEnoughFunds={notEnoughFunds}
          stepButtonDisabled={stepButtonDisabled}
        />
      )}
      {stage === "preview" && selectedToken && (
        <StagePreview
          selectedToken={selectedToken}
          activeAccount={activeAccount}
          recipientAddress={recipientAddress}
          amount={amount}
          feeManager={transactionManager?.feeStrategy ?? null}
          onCompleted={handleShowStageCompleted}
          error={error}
          notification={notification}
          stepButtonDisabled={stepButtonDisabled}
        />
      )}
      {stage === "warning" && (
        <StageWarning
          recipientAddress={recipientAddress}
          onContractAsRecipientAcceptedChange={setContractAsRecipientAccepted}
          onPreview={handleShowStagePreview}
          onSetup={handleShowStageSetup}
          error={error}
          stepButtonDisabled={stepButtonDisabled}
        />
      )}
    </>
  );
}
