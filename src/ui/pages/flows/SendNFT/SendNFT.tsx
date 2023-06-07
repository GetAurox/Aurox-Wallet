import { ReactNode, useMemo, useState } from "react";
import { One as BigNumberOne } from "@ethersproject/constants";

import { Theme, Stack, Box, Divider, Button, Typography, IconButton } from "@mui/material";
import RepeatOnIcon from "@mui/icons-material/RepeatOn";
import WarningIcon from "@mui/icons-material/Warning";

import { getUNSDomainRecordTypeFromTokenDisplay } from "common/utils";
import { addressIsContract, ProviderManager } from "common/wallet";
import { NFTItem } from "common/types";

import useAnalytics from "ui/common/analytics";
import { useHistoryReset, useHistoryGoBack, useHistoryPathParams } from "ui/common/history";

import {
  useActiveAccount,
  useStages,
  useActiveAccountNetworkAddress,
  useNetworkByIdentifier,
  useNativeTokenMarketTicker,
  useNetworkBlockchainExplorerLinkResolver,
  useDebounce,
  useNSResolveDomainFromAddress,
  useNSResolveAddressFromDomain,
  useActiveAccountFlatNFTBalances,
} from "ui/hooks";
import { useTransactionManager } from "ui/hooks/rpc";

import ApproximateFee from "ui/components/flows/feeSelection/ApproximateFee";
import CurrentNetworkInfo from "ui/components/flows/info/CurrentNetworkInfo";
import FromAndToDetails from "ui/components/flows/info/FromAndToDetailsInfo";
import StageWrapper from "ui/components/flows/stages/StageWrapper";
import WarningStage from "ui/components/flows/stages/WarningStage";
// TODO: uncomment later
// import MemoInput from "ui/components/flows/info/MemoInput";
import NFTHeader from "ui/components/entity/nft/NFTHeader";
import AlertStatus from "ui/components/common/AlertStatus";
import Success from "ui/components/layout/misc/Success";
import FormField from "ui/components/form/FormField";
import ErrorText from "ui/components/form/ErrorText";
import NetworkFee from "ui/components/flows/feeSelection/NetworkFee";
import { isDomainName, isEthereumAddress } from "ui/common/validators";

import { getEVMTokenTransfer } from "ui/common/tokens";

import { EthereumAccountTokenContractType } from "ui/types";

import WalletSelectorSendModal from "../WalletSelectorSendModal";

const sxStyles = {
  divider: {
    marginTop: 10,
    opacity: 0.6,
  },
  formField: {
    helper: {
      "&.MuiFormHelperText-root": {
        color: "error.main",
      },
    },
  },
};

const stages = ["setup", "warning", "preview", "completed"] as const;

type Stage = typeof stages[number];

export function SendNFT() {
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [recipient, setRecipient] = useState("");
  const [disableButton, setDisableButton] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { stage, back, setStage } = useStages<Stage>(stages);
  const [notification, setNotification] = useState<string | null>(null);
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState(false);

  const {
    tokenId: nftId,
    contractAddress = "",
    networkIdentifier = "",
  } = useHistoryPathParams<"tokenId" | "contractAddress" | "networkIdentifier">();

  const reset = useHistoryReset();
  const goToPreviousPage = useHistoryGoBack();

  const activeAccount = useActiveAccount();
  const activeAccountNetworkAddress = useActiveAccountNetworkAddress();

  const { trackButtonClicked } = useAnalytics();

  const network = useNetworkByIdentifier(networkIdentifier);

  const nativeTicker = useNativeTokenMarketTicker(networkIdentifier);

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(networkIdentifier);

  const balances = useActiveAccountFlatNFTBalances();

  const balance = balances.find(nft => nft.tokenId === nftId && nft.contractAddress === contractAddress);

  const nft = balance
    ? ({
        id: balance.tokenId,
        status: "pending",
        networkIdentifier: networkIdentifier,
        name: balance.name,
        tokenId: balance.tokenId,
        symbol: balance.symbol,
        icon: balance.metadata?.image ?? "",
        decimals: balance.decimals,
        tokenAddress: balance.contractAddress,
        accountAddress: activeAccountNetworkAddress,
        tokenContractType: balance.contractType as EthereumAccountTokenContractType,
      } as NFTItem)
    : null;

  const debouncedRecipient = useDebounce(recipient, 300);

  const { loading: resolvingDomain, domain: resolvedDomain } = useNSResolveDomainFromAddress({ address: debouncedRecipient });
  const { loading: resolvingAddress, address: resolvedAddress } = useNSResolveAddressFromDomain({
    unsDomainRecordType: getUNSDomainRecordTypeFromTokenDisplay(),
    domain: debouncedRecipient,
  });

  const recipientAddress = resolvedAddress || recipient;

  const transaction = useMemo(() => {
    if (!activeAccountNetworkAddress || !contractAddress || !nftId || !nft?.tokenContractType || !isEthereumAddress(recipientAddress)) {
      return null;
    }

    return getEVMTokenTransfer({
      assetDefinition: { type: "contract", contractAddress, contractType: nft.tokenContractType },
      fromAddress: activeAccountNetworkAddress,
      recipientAddress,
      amount: BigNumberOne,
      tokenId: nftId,
    });
  }, [activeAccountNetworkAddress, nft?.tokenContractType, contractAddress, nftId, recipientAddress]);

  const transactionManager = useTransactionManager(activeAccount, networkIdentifier, transaction);

  const approximateFee = (transactionManager?.feeStrategy?.feePriceInNativeCurrency ?? 0) * Number(nativeTicker?.priceUSD ?? 0);

  const handleGoToPreview = async () => {
    if (!activeAccount || !network || !nft) throw new Error("Cannot move to preview as fields are missing");

    const isAddressContract = await addressIsContract(ProviderManager.getProvider(network), recipientAddress);

    if (isAddressContract) {
      setStage("warning");
    } else {
      setStage("preview");
    }
  };

  const handleConfirm = async () => {
    if (!activeAccount || !network || !transactionManager) throw new Error("Cannot confirm transaction as fields are missing");

    setError("");
    setNotification(null);

    if (activeAccount.type === "hardware") {
      setNotification(`Check your ${activeAccount.hardwareType} device`);
    }

    setDisableButton(true);

    try {
      const { hash } = await transactionManager.sendTransaction({
        message: `Send ${nft?.name}`,
        blockExplorerTxBaseURL: getTransactionExplorerLink(""),
      });

      trackButtonClicked("Sent NFT");

      setTxHash(hash);
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
    reset(txHash ? `/transactions/${txHash}/details` : "/transactions");
  };

  const handleSetRecipient = (recipient: string) => {
    setRecipient(recipient);
  };

  const handleWalletSelectorOpen = () => {
    setIsWalletSelectorOpen(true);
  };

  const handleWalletSelectorClose = () => {
    setIsWalletSelectorOpen(false);
  };

  const handleWalletSelectorSelect = (address: string) => {
    handleSetRecipient(address);
    handleWalletSelectorClose();
  };

  let recipientResolvingResult: ReactNode = null;
  let validationError: string | null = null;

  const isResolvedDomain = !!resolvedDomain && !resolvingDomain;
  const isDifferentRecipient = !!recipientAddress && recipientAddress !== recipient;
  const isDomainNameRecipient = isDomainName(recipient) && !resolvingAddress;

  const shouldRenderResolvedDomain = isEthereumAddress(recipient) && isResolvedDomain;
  const shouldRenderRecipientAddress = isDomainNameRecipient && isDifferentRecipient;

  if (recipient && (shouldRenderRecipientAddress || shouldRenderResolvedDomain)) {
    recipientResolvingResult = (
      <Typography variant="medium" mt="9px" color="text.secondary">
        {shouldRenderResolvedDomain ? resolvedDomain : recipientAddress}
      </Typography>
    );
    validationError = null;
  }

  if (recipient && isDomainNameRecipient && !isDifferentRecipient) {
    recipientResolvingResult = (
      <Stack mt="9px" direction="row" alignItems="center" columnGap={0.5}>
        <WarningIcon fontSize="small" color="warning" />
        <Typography variant="medium" color="warning.main">
          Invalid recipient
        </Typography>
      </Stack>
    );

    validationError = "Invalid recipient";
  }

  if (stage === "setup") {
    const disableButton = recipient === "" || error !== "" || validationError !== null || !isEthereumAddress(recipientAddress);

    return (
      <StageWrapper
        title="Transfer NFT"
        back={goToPreviousPage}
        onClick={handleGoToPreview}
        close={goToPreviousPage}
        buttonText="Preview"
        disabled={disableButton}
      >
        <>
          {nft && (
            <NFTHeader
              id={nft.id}
              name={nft.name}
              icon={nft.icon ?? ""}
              tokenAddress={nft.tokenAddress}
              networkIdentifier={nft.networkIdentifier}
              tokenContractType={nft.tokenContractType}
            />
          )}
          <Divider color="#2A2E39" variant="fullWidth" style={sxStyles.divider} />

          <Box mt="17px">
            <FormField
              label="Recipient Address"
              placeholder="Enter address"
              name="recipient"
              autoComplete="off"
              sx={sxStyles.formField}
              value={recipient}
              onChange={event => handleSetRecipient(event.target.value)}
              error={validationError !== null}
              helper={validationError}
              endAdornment={
                <IconButton onClick={handleWalletSelectorOpen}>
                  <RepeatOnIcon color="primary" />
                </IconButton>
              }
            />
            {recipientResolvingResult}
          </Box>

          {/* TODO: uncomment later */}
          {/* <MemoInput memo={memo} onChange={setMemo} /> */}
          <CurrentNetworkInfo networkName={network?.name} />
          <Box flexGrow={1} />

          <ApproximateFee fee={approximateFee || undefined} />

          <ErrorText error={error} mt={1} justifyContent="center" />
          <WalletSelectorSendModal open={isWalletSelectorOpen} onSelect={handleWalletSelectorSelect} onClose={handleWalletSelectorClose} />
        </>
      </StageWrapper>
    );
  }

  if (stage === "warning") {
    return (
      <StageWrapper title="Transfer NFT" back={back} onClick={handleGoToPreview} close={goToPreviousPage} hideButton>
        <>
          <WarningStage recipient={recipientAddress} networkIdentifier={network?.identifier} />
          <Box flexGrow={1} />

          <Button sx={{ mt: "10px" }} variant="contained" onClick={() => setStage("preview")}>
            Continue
          </Button>
          <Button sx={{ my: "15px" }} variant="outlined" onClick={back}>
            Go Back
          </Button>
        </>
      </StageWrapper>
    );
  }

  if (stage === "preview") {
    return (
      <StageWrapper
        title="Preview"
        back={() => setStage("setup")}
        disabled={disableButton}
        isLoading
        onClick={handleConfirm}
        close={goToPreviousPage}
        buttonText={"Confirm and Send"}
      >
        <>
          {nft && (
            <NFTHeader
              id={nft.id}
              name={nft.name}
              icon={nft.icon ?? ""}
              tokenAddress={nft.tokenAddress}
              networkIdentifier={nft.networkIdentifier}
              tokenContractType={nft.tokenContractType}
            />
          )}
          <Divider color="#2A2E39" variant="fullWidth" style={sxStyles.divider} />

          <FromAndToDetails from={activeAccountNetworkAddress ?? ""} to={recipientAddress} />
          {/* TODO: uncomment later */}
          {/* <Stack mt="14px">
            <Typography variant="medium" color="text.secondary">
              Memo
            </Typography>
            <Typography variant="large" mt={0.75} sx={{ wordBreak: "break-all" }}>
              {memo}
            </Typography>
          </Stack> */}
          <Divider sx={{ mt: 2.25, borderColor: (theme: Theme) => theme.palette.custom.grey["19"] }} />

          <Stack mt="17px" direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="medium" color="text.secondary">
              Send:
            </Typography>
            <Typography variant="medium">{nft?.name}</Typography>
          </Stack>
          {network?.identifier && (
            <NetworkFee networkIdentifier={network.identifier} feeManager={transactionManager?.feeStrategy ?? null} />
          )}
          {notification && (
            <Stack mt={1}>
              <AlertStatus info infoText={notification} />
            </Stack>
          )}
          <ErrorText error={error} mt={1} justifyContent="center" />
        </>
      </StageWrapper>
    );
  }

  return <Success heading="Complete" subheading="Operation is in progress" buttonDisabled={false} onButtonClick={handleComplete} />;
}
