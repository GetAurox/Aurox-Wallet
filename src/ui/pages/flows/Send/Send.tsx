import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Decimal from "decimal.js";

import { getAccountAddressForChainType, getUNSDomainRecordTypeFromTokenDisplay } from "common/utils";
import { Wallet } from "common/operations";

import { useHistoryGoBack, useHistoryReset, useHistoryState } from "ui/common/history";
import { isEthereumAddress } from "ui/common/validators";
import {
  useActiveAccount,
  useNetworkByIdentifier,
  useTokenAssetTicker,
  useAssertBalancesSynchronizedForAssets,
  useIsSufficientFundsForTransaction,
  useTokenAssetDisplay,
  useDebounce,
  useNSResolveAddressFromDomain,
  useNSResolveDomainFromAddress,
  useNetworkBlockchainExplorerLinkResolver,
} from "ui/hooks";

import Success from "ui/components/layout/misc/Success";
import Header from "ui/components/layout/misc/Header";

import { useRewardSystemContext } from "ui/common/rewardSystem";

import { useTransactionManager } from "ui/hooks/rpc";

import { RawTransaction } from "common/types";

import { ERC20Transfer } from "ui/common/tokens";

import { submittingTransaction } from "./mock";

import StageSetup from "./StageSetup";
import StagePreview from "./StagePreview";
import StageWarning from "./StageWarning";

export function Send() {
  const reset = useHistoryReset();
  const goBack = useHistoryGoBack();

  const [assetKey, setAssetKey] = useHistoryState<string | null>("assetKey", null);

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  // const [memo, setMemo] = useState("");

  const [contractAsRecipientAccepted, setContractAsRecipientAccepted] = useState(false);

  const [transaction, setTransaction] = useState<RawTransaction | null>(null);

  const [txHash, setTxHash] = useState<string | null>();
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [disableButton, setDisableButton] = useState(false);

  const activeAccount = useActiveAccount();

  const selectedToken = useTokenAssetTicker(assetKey);
  const selectedTokenNetwork = useNetworkByIdentifier(selectedToken?.networkIdentifier);

  const transactionManager = useTransactionManager(activeAccount, selectedToken?.networkIdentifier ?? null, transaction);

  useAssertBalancesSynchronizedForAssets(assetKey);

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(selectedToken?.networkIdentifier);

  const [stage, setStage] = useState<"setup" | "preview" | "warning" | "completed">("setup");

  const { publish } = useRewardSystemContext();

  const normalizedAmount = !amount.trim() ? "0" : amount;

  const isSufficientFundsForTransaction = useIsSufficientFundsForTransaction({
    token: useTokenAssetDisplay(assetKey),
    amount: normalizedAmount,
    feeSettings: transactionManager?.feeManager?.feeSettingsForEthereum ?? null,
  });

  const normalizedBalance = !selectedToken?.balance ? "0" : selectedToken.balance;
  const exceedsBalance = selectedToken ? new Decimal(normalizedBalance).lessThan(new Decimal(normalizedAmount)) : false;

  const handleShowStageInitial = () => {
    setAssetKey(null);
    goBack();
  };

  const handleShowStageSetup = () => {
    setStage("setup");
  };

  // Formats the transaction correctly
  const handleShowStagePreview = async () => {
    if (!selectedToken || !selectedTokenNetwork || !activeAccount) throw new Error("Missing required fields");
    setError(null);

    setStage("preview");
  };

  const handleShowStageWarning = () => {
    setStage("warning");
  };

  // Sends off the transaction
  const handleShowStageCompleted = async () => {
    if (!transactionManager || !activeAccount) return;

    setError(null);

    if (activeAccount.type === "hardware") {
      setNotification(`Check your ${activeAccount.hardwareType} device`);
    }

    setDisableButton(true);

    try {
      const transactionHash = await transactionManager.sendTransaction(undefined, {
        message: `Send ${selectedToken?.name}`,
        blockExplorerTxBaseURL: getTransactionExplorerLink(""),
      });

      setTxHash(transactionHash);

      if (activeAccount.type === "hardware") {
        setStage("completed");
      }

      const signature = await Wallet.SignMessage.perform({
        chainType: "evm",
        message: transactionHash,
        uuid: activeAccount.uuid,
        shouldArrayify: true,
      });

      publish("aurox.my.token_transaction", [], {
        hash: transactionHash,
        signature,
        ...(selectedTokenNetwork && { chain_id: selectedTokenNetwork.chainId }),
      });

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

  const handleRecipientChange = (newRecipient: string) => {
    setRecipient(newRecipient);
  };

  const debouncedRecipient = useDebounce(recipient, 300);

  const { loading: resolvingDomain, domain: resolvedDomain } = useNSResolveDomainFromAddress({ address: debouncedRecipient });
  const { loading: resolvingAddress, address: resolvedAddress } = useNSResolveAddressFromDomain({
    unsDomainRecordType: getUNSDomainRecordTypeFromTokenDisplay(selectedToken),
    domain: debouncedRecipient,
  });

  const recipientAddress = resolvedAddress || recipient;

  useEffect(() => {
    const amountDecimal = new Decimal(normalizedAmount);

    if (!isEthereumAddress(recipientAddress) || amountDecimal.eq(0) || !selectedToken || !activeAccount || !selectedTokenNetwork) {
      return;
    }

    const from = getAccountAddressForChainType(activeAccount, selectedTokenNetwork.chainType);
    const to = selectedToken.assetDefinition.type === "native" ? recipientAddress : selectedToken.assetDefinition.contractAddress;

    const value = ethers.utils.parseUnits(amountDecimal.toDP(selectedToken.decimals).toFixed(), selectedToken.decimals);

    if (selectedToken.assetDefinition.type === "native") {
      const transaction = { from, to, data: "0x", value: value.toHexString() };

      setTransaction(transaction);
    } else {
      const transfer = new ERC20Transfer(from, to);

      transfer.updateAmountAndRecipient(value, recipientAddress);

      setTransaction(transfer.transaction);
    }

    return () => {
      transactionManager?.cancelFeeUpdate();
    };
    // Need this to fire only on amount and recipient address change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedAmount, recipientAddress]);

  useEffect(() => {
    if (stage === "setup") {
      setError(null);
    }
  }, [stage]);

  useEffect(() => {
    setContractAsRecipientAccepted(false);
  }, [recipient]);

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
    !transactionManager?.feeManager;

  const notEnoughFunds = !missingRequiredInformation && !isSufficientFundsForTransaction;

  const stepButtonDisabled =
    missingRequiredInformation ||
    exceedsBalance ||
    error !== null ||
    !transactionManager.feeManager.hasEnoughFunds ||
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
          // memo={memo}
          // onMemoChange={setMemo}
          feeManager={transactionManager?.feeManager ?? null}
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
          feeManager={transactionManager?.feeManager ?? null}
          // memo={memo}
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
