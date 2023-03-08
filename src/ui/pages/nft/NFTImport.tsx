import { useState, ChangeEvent, useEffect } from "react";

import { Theme, Alert, AlertColor, Box, Button, Typography } from "@mui/material";

import { createAssetKey, getAssetIdentifierFromDefinition } from "common/utils";
import { ImportedAsset } from "common/operations";
import { ethereumMainnetNetworkIdentifier } from "common/config";

import { useEnabledNetworks, useTokenInformation } from "ui/hooks";

import { isEthereumAddress } from "ui/common/validators";
import { useHistoryGoBack } from "ui/common/history";

import FormField from "ui/components/form/FormField";
import Header from "ui/components/layout/misc/Header";
import NetworkIdentifierPickerModal from "ui/components/modals/NetworkIdentifierPickerModal";

import { IconArrowDownIOS } from "ui/components/icons";
import DefaultControls from "ui/components/controls/DefaultControls";

interface FormState {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number | null;
}

const defaultFormState: FormState = {
  contractAddress: "",
  symbol: "",
  name: "",
  decimals: null,
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
  const [selectedNetworkIdentifier, setSelectedNetworkIdentifier] = useState(ethereumMainnetNetworkIdentifier);

  const [openNetworksModal, setOpenNetworksModal] = useState(false);

  const goBack = useHistoryGoBack();

  const networks = useEnabledNetworks();

  const selectedNetwork = networks?.find(network => network.identifier === selectedNetworkIdentifier);

  const { loading, error, tokenInformation } = useTokenInformation(
    isEthereumAddress(formState.contractAddress) ? formState.contractAddress : null,
    selectedNetwork?.identifier ?? null,
  );

  const handleOpenNetworkModal = () => setOpenNetworksModal(true);
  const handleCloseNetworkModal = () => setOpenNetworksModal(false);

  useEffect(() => {
    if (isEthereumAddress(formState.contractAddress) && !manuallyEdited) {
      const { name, symbol, decimals } = tokenInformation ?? defaultFormState;

      setFormState(prevState => ({ ...prevState, name, symbol, decimals }));
    }
  }, [tokenInformation, manuallyEdited, formState.contractAddress]);

  useEffect(() => {
    if (loading) {
      setStatus({ severity: "info", text: "Loading token information..." });
    } else if (error) {
      setStatus({ severity: "error", text: "Error loading token information" });
    } else {
      setStatus(null);
    }
  }, [loading, error]);

  const handleContractAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({ ...prevState, contractAddress: event.target.value }));

    setManuallyEdited(false);
  };
  const handleSymbolChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({ ...prevState, symbol: event.target.value }));

    setManuallyEdited(true);
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState(prevState => ({ ...prevState, name: event.target.value }));

    setManuallyEdited(true);
  };
  const handleDecimalsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newDecimals = Number(event.target.value);

    const value = !event.target.value || Number.isNaN(newDecimals) ? null : newDecimals;

    setFormState(prevState => ({ ...prevState, decimals: value }));

    setManuallyEdited(true);
  };
  const handleNetworkSelect = (identifier: string) => {
    if (selectedNetworkIdentifier !== identifier) {
      setManuallyEdited(false);

      setFormState(prevState => ({ ...prevState, name: "", symbol: "", decimals: null }));

      setSelectedNetworkIdentifier(identifier);
    }

    handleCloseNetworkModal();
  };

  const handleImportNFT = async () => {
    if (
      !selectedNetwork ||
      !isEthereumAddress(formState.contractAddress) ||
      formState.decimals === null ||
      !formState.name.trim() ||
      !formState.symbol.trim()
    ) {
      return;
    }

    // TODO: only EVM is case insensitive, for other chains we must not do this
    const sanitizedAddress = String(formState.contractAddress).toLowerCase();

    try {
      setStatus({ severity: "info", text: "Importing NFT..." });

      const assetIdentifier = getAssetIdentifierFromDefinition({
        type: "contract",
        contractType: "ERC20",
        contractAddress: sanitizedAddress,
      });

      await ImportedAsset.ImportNewAsset.perform({
        key: createAssetKey(selectedNetwork.identifier, assetIdentifier),
        assetIdentifier,
        networkIdentifier: selectedNetwork.identifier,
        contractType: "ERC20",
        contractAddress: sanitizedAddress,
        type: "nft",
        symbol: formState.symbol,
        name: formState.name,
        decimals: formState.decimals,
        // We treat user imported assets as trusted, therefore, even if we think they are unverified, we should show it anyway
        visibility: "force-show",
        // Anything the user imports is de-facto verified until our backend confirms otherwise
        verified: true,
        autoImported: false,
      });

      setStatus(null);

      goBack();
    } catch (error) {
      setStatus({ severity: "error", text: error.message });
    }
  };

  const valid =
    isEthereumAddress(formState.contractAddress) && formState.decimals !== null && formState.name.trim() && formState.symbol.trim();

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
          disabled={status?.severity === "info"}
        />
        <Box mt={2}>
          <FormField label="NFT Symbol" value={formState.symbol} onChange={handleSymbolChange} disabled={status?.severity === "info"} />
        </Box>
        <Box mt={2}>
          <FormField label="NFT Name" value={formState.name} onChange={handleNameChange} disabled={status?.severity === "info"} />
        </Box>
        <Box mt={2}>
          <FormField
            label="NFT Decimals"
            value={String(formState.decimals ?? "")}
            onChange={handleDecimalsChange}
            disabled={status?.severity === "info"}
          />
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
