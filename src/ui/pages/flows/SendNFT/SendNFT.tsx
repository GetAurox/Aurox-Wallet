import { useMemo, useState } from "react";
import { ethers } from "ethers";

import { Theme, Stack, Box, Divider, Button, Typography } from "@mui/material";

import { addressIsContract, ProviderManager } from "common/wallet";
import { createNetworkIdentifier } from "common/utils";
import { ethereumMainnetNetworkIdentifier, ETHEREUM_MAINNET_CHAIN_ID } from "common/config";
import { NFTItem } from "common/types";

import {
  useActiveAccount,
  useStages,
  useActiveAccountNetworkAddress,
  useNetworkByIdentifier,
  useNativeTokenMarketTicker,
  useNetworkBlockchainExplorerLinkResolver,
} from "ui/hooks";
import { useHistoryReset, useHistoryGoBack, useHistoryPathParams } from "ui/common/history";

import ApproximateFee from "ui/components/flows/feeSelection/ApproximateFee";
import CurrentNetworkInfo from "ui/components/flows/info/CurrentNetworkInfo";
import FromAndToDetails from "ui/components/flows/info/FromAndToDetailsInfo";
import StageWrapper from "ui/components/flows/stages/StageWrapper";
import WarningStage from "ui/components/flows/stages/WarningStage";
import NFTHeader from "ui/components/entity/nft/NFTHeader";
// TODO: uncomment later
// import MemoInput from "ui/components/flows/info/MemoInput";
import Success from "ui/components/layout/misc/Success";
import FormField from "ui/components/form/FormField";
import ErrorText from "ui/components/form/ErrorText";

import { useAccountNFTsBalance } from "ui/hooks/accounts/useAccountNFTsBalance";
import { useTransactionManager } from "ui/hooks/rpc";
import NetworkFeeV2 from "ui/components/flows/feeSelection/NetworkFeeV2";
import { ERC1155Transfer, ERC721Transfer } from "ui/common/tokens";
import AlertStatus from "ui/components/common/AlertStatus";

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
  const { tokenId: nftId, contractAddress = "" } = useHistoryPathParams<"tokenId" | "contractAddress">();

  const goToPreviousPage = useHistoryGoBack();
  const reset = useHistoryReset();

  const [disableButton, setDisableButton] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const { stage, back, setStage } = useStages<Stage>(stages);
  const [recipient, setRecipient] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [memo, setMemo] = useState("");

  const activeAccount = useActiveAccount();
  const activeAccountNetworkAddress = useActiveAccountNetworkAddress();

  // TODO: Change this to use network of the NFT!!!
  const networkIdentifier = ethereumMainnetNetworkIdentifier;

  const network = useNetworkByIdentifier(networkIdentifier);

  const nativeTicker = useNativeTokenMarketTicker(networkIdentifier);

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(networkIdentifier);

  const { balances } = useAccountNFTsBalance([activeAccountNetworkAddress]);

  const [nft] =
    balances[activeAccountNetworkAddress ?? ""]?.balance.nftTokens
      .filter(nft => nft.tokenId === nftId && nft.tokenAddress === contractAddress)
      .map(nft => {
        return {
          id: nft.metadata?.id ?? "",
          status: "pending",
          artistName: nft.metadata?.creatorUsername ?? "",
          networkIdentifier: createNetworkIdentifier("evm", ETHEREUM_MAINNET_CHAIN_ID),
          name: nft.metadata?.name ?? nft.token.name,
          tokenId: nft.tokenId,
          symbol: nft.token.symbol,
          icon: nft.metadata?.imageUrl,
          decimals: nft.token.decimals,
          tokenAddress: nft.tokenAddress,
          accountAddress: nft.accountAddress,
          tokenContractType: nft.tokenContractType,
        } as NFTItem;
      }) ?? [];

  const transfer = useMemo(() => {
    if (!activeAccountNetworkAddress || !contractAddress || !nftId || !nft?.tokenContractType) {
      return null;
    }

    if (nft.tokenContractType === "ERC721") {
      return new ERC721Transfer(activeAccountNetworkAddress, contractAddress, nftId);
    }

    if (nft.tokenContractType === "ERC1155") {
      return new ERC1155Transfer(activeAccountNetworkAddress, contractAddress, nftId, ethers.constants.One.toHexString());
    }

    return null;
  }, [activeAccountNetworkAddress, nft?.tokenContractType, contractAddress, nftId]);

  const transactionManager = useTransactionManager(activeAccount, networkIdentifier, transfer?.transaction ?? null);

  const approximateFee = (transactionManager?.feeManager?.feePriceInNativeCurrency ?? 0) * Number(nativeTicker?.priceUSD ?? 0);

  const handleGoToPreview = async () => {
    if (!activeAccount || !network || !nft) throw new Error("Cannot move to preview as fields are missing");

    const isAddressContract = await addressIsContract(ProviderManager.getProvider(network), recipient);

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
      const hash = await transactionManager.sendTransaction(undefined, {
        message: `Send ${nft.name}`,
        blockExplorerTxBaseURL: getTransactionExplorerLink(""),
      });

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
    const isValidAddress = ethers.utils.isAddress(recipient);

    if (isValidAddress) {
      transfer?.updateRecipient(recipient);
    }

    setRecipient(recipient);
    setValidationError(isValidAddress ? null : "Incorrect address");
  };

  if (stage === "setup") {
    const disableButton = recipient === "" || error !== "" || validationError !== null;

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
            />
          </Box>

          {/* TODO: uncomment later */}
          {/* <MemoInput memo={memo} onChange={setMemo} /> */}
          <CurrentNetworkInfo networkName={network?.name} />
          <Box flexGrow={1} />

          <ApproximateFee fee={approximateFee || undefined} />

          <ErrorText error={error} mt={1} justifyContent="center" />
        </>
      </StageWrapper>
    );
  }

  if (stage === "warning") {
    return (
      <StageWrapper title="Transfer NFT" back={back} onClick={handleGoToPreview} close={goToPreviousPage} hideButton>
        <>
          <WarningStage recipient={recipient} networkIdentifier={network?.identifier} />
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

          <FromAndToDetails from={activeAccountNetworkAddress ?? ""} to={recipient} />
          <Stack mt="14px">
            <Typography variant="medium" color="text.secondary">
              Memo
            </Typography>
            <Typography variant="large" mt={0.75} sx={{ wordBreak: "break-all" }}>
              {memo}
            </Typography>
          </Stack>
          <Divider sx={{ mt: 2.25, borderColor: (theme: Theme) => theme.palette.custom.grey["19"] }} />

          <Stack mt="17px" direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="medium" color="text.secondary">
              Send:
            </Typography>
            <Typography variant="medium">{nft.name}</Typography>
          </Stack>
          {network?.identifier && (
            <NetworkFeeV2 networkIdentifier={network.identifier} feeManager={transactionManager?.feeManager ?? null} />
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
