import { useState, ChangeEvent, useEffect, useRef } from "react";

import { Theme, Alert, AlertColor, Box, Button, Typography } from "@mui/material";

import { createAssetKey, getAssetIdentifierFromDefinition } from "common/utils";
import { ImportedAsset } from "common/operations";
import { ethereumMainnetNetworkIdentifier } from "common/config";

import { useActiveAccountNetworkAddress, useDebounce, useEnabledNetworks } from "ui/hooks";
import { useNFTInformation } from "ui/hooks/misc/useNFTInformation";

import { isEthereumAddress } from "ui/common/validators";
import { useHistoryGoBack } from "ui/common/history";
import useAnalytics from "ui/common/analytics";

import FormField from "ui/components/form/FormField";
import Header from "ui/components/layout/misc/Header";
import { IconArrowDownIOS } from "ui/components/icons";
import DefaultControls from "ui/components/controls/DefaultControls";
import NetworkIdentifierPickerModal from "ui/components/modals/NetworkIdentifierPickerModal";

interface FormState {
  contractAddress: string;
  id: string;
}

const defaultFormState: FormState = {
  contractAddress: "",
  id: "",
};

const sxStyles = {
  networkLabel: {
    marginBottom: "7px",
  },
  networkButton: {
    "&.MuiButton-root": {
      padding: "10px 12px",
      backgroundColor: (theme: Theme) => theme.palette.custom.grey["19"],
      borderRadius: "12px",
      textAlign: "left",
    },
    ".MuiButton-endIcon": {
      marginRight: 0,
      marginLeft: 0.5,
    },
  },
};

export default function NFTImport() {
  const [formState, setFormState] = useState(defaultFormState);

  const [manuallyEdited, setManuallyEdited] = useState(false);

  const [status, setStatus] = useState<{ severity: AlertColor; text: string } | null>(null);

  const [focus, setFocus] = useState<null | "address" | "id">(null);

  const idRef = useRef<HTMLInputElement>(null);

  const addressRef = useRef<HTMLInputElement>(null);

  const [selectedNetworkIdentifier, setSelectedNetworkIdentifier] = useState(ethereumMainnetNetworkIdentifier);

  const [openNetworksModal, setOpenNetworksModal] = useState(false);

  const { trackButtonClicked } = useAnalytics();

  const goBack = useHistoryGoBack();

  const networks = useEnabledNetworks();

  const activeAccount = useActiveAccountNetworkAddress();

  const selectedNetwork = networks?.find(network => network.identifier === selectedNetworkIdentifier);

  const debouncedContractAddress = useDebounce(formState.contractAddress, 300);

  const debouncedTokenId = useDebounce(formState.id, 1000);

  const { loading, error, tokenInformation } = useNFTInformation(
    isEthereumAddress(debouncedContractAddress) ? debouncedContractAddress : null,
    activeAccount,
    debouncedTokenId !== "" ? debouncedTokenId : null,
    selectedNetwork?.identifier ?? null,
  );

  const handleOpenNetworkModal = () => setOpenNetworksModal(true);
  const handleCloseNetworkModal = () => setOpenNetworksModal(false);

  useEffect(() => {
    if (loading) {
      setStatus({ severity: "info", text: "Loading token information..." });
    } else if (error) {
      setStatus({ severity: "error", text: "Error loading token information" });
    } else {
      setStatus(null);
    }
  }, [loading, error]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!!formState.id && !!formState.contractAddress) {
      timeout = setTimeout(() => {
        if (focus === "id") {
          idRef?.current?.focus();
        } else if (focus === "address") {
          addressRef?.current?.focus();
        }
      }, 100);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [focus, tokenInformation, loading, error, formState.id, formState.contractAddress]);

  const handleContractAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({ ...prevState, contractAddress: event.target.value }));

    setFocus("address");

    setManuallyEdited(false);
  };

  const handleIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({ ...prevState, id: event.target.value }));

    setFocus("id");

    setManuallyEdited(true);
  };

  const handleNetworkSelect = (identifier: string) => {
    if (selectedNetworkIdentifier !== identifier) {
      setManuallyEdited(false);

      setFormState(prevState => ({ ...prevState }));

      setSelectedNetworkIdentifier(identifier);
    }

    handleCloseNetworkModal();
  };

  const handleImportNFT = async () => {
    if (
      !selectedNetwork ||
      !isEthereumAddress(formState.contractAddress) ||
      !tokenInformation?.contractType ||
      !tokenInformation?.metadata
    ) {
      return;
    }

    // TODO: only EVM is case insensitive, for other chains we must not do this
    const sanitizedAddress = String(formState.contractAddress).toLowerCase();

    try {
      setStatus({ severity: "info", text: "Importing NFT..." });

      const assetIdentifier = getAssetIdentifierFromDefinition({
        type: "nft",
        contractType: tokenInformation.contractType,
        contractAddress: sanitizedAddress,
        tokenId: formState.id,
      });

      await ImportedAsset.ImportNewAsset.perform({
        key: createAssetKey(selectedNetwork.identifier, assetIdentifier),
        assetIdentifier,
        networkIdentifier: selectedNetwork.identifier,
        contractType: tokenInformation.contractType,
        contractAddress: sanitizedAddress,
        type: "nft",
        symbol: "",
        name: tokenInformation.metadata.name,
        decimals: 0,
        // We treat user imported assets as trusted, therefore, even if we think they are unverified, we should show it anyway
        visibility: "force-show",
        // Anything the user imports is de-facto verified until our backend confirms otherwise
        verified: true,
        autoImported: false,
        metadata: {
          tokenId: formState.id,
          image: tokenInformation.metadata.image,
          updatedAt: Date.now(),
          accountAddress: activeAccount ?? "",
        },
      });

      trackButtonClicked("Imported NFT");

      setStatus(null);

      goBack();
    } catch (error) {
      setStatus({ severity: "error", text: error.message });
    }
  };

  const valid = isEthereumAddress(formState.contractAddress) && selectedNetwork && tokenInformation !== null;

  return (
    <>
      <Header title="Import NFT" onBackClick={goBack} />
      <Box mt={3} px={2} pb={2}>
        {status && (
          <Alert severity={status.severity} sx={{ mb: 2 }}>
            {status.text}
          </Alert>
        )}
        {selectedNetwork && (
          <Box mb={2}>
            <Typography variant="medium" sx={sxStyles.networkLabel}>
              Network
            </Typography>
            <Button
              fullWidth
              disableRipple
              color="inherit"
              variant="text"
              onClick={handleOpenNetworkModal}
              sx={sxStyles.networkButton}
              endIcon={<IconArrowDownIOS />}
              disabled={status?.severity === "info"}
            >
              <Typography component="span" sx={{ flex: 1 }}>
                {selectedNetwork.name}
              </Typography>
            </Button>
          </Box>
        )}
        <FormField
          label="NFT Contract Address"
          value={formState.contractAddress}
          onChange={handleContractAddressChange}
          ref={addressRef}
          disabled={status?.severity === "info"}
        />
        <Box mt={2}>
          <FormField label="NFT ID" value={formState.id} onChange={handleIdChange} disabled={status?.severity === "info"} ref={idRef} />
        </Box>
      </Box>

      <Box flexGrow={1} />

      <DefaultControls
        primary="Import NFT"
        disabledPrimary={status?.severity === "info" || status?.severity === "error" || !valid}
        onPrimary={handleImportNFT}
      />

      <NetworkIdentifierPickerModal
        open={openNetworksModal}
        onClose={handleCloseNetworkModal}
        current={selectedNetworkIdentifier}
        onSelect={handleNetworkSelect}
      />
    </>
  );
}
