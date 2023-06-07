import { useState, ChangeEvent, useEffect } from "react";

import { Theme, Alert, AlertColor, Box, Button, Typography } from "@mui/material";

import { createAssetKey, getAssetIdentifierFromDefinition } from "common/utils";
import { ImportedAsset } from "common/operations";
import { ethereumMainnetNetworkIdentifier } from "common/config";

import { useEnabledNetworks, useTokenInformation } from "ui/hooks";

import { isEthereumAddress } from "ui/common/validators";
import { useHistoryGoBack } from "ui/common/history";
import useAnalytics from "ui/common/analytics";

import FormField from "ui/components/form/FormField";
import Header from "ui/components/layout/misc/Header";
import { IconArrowDownIOS } from "ui/components/icons";
import NetworkIdentifierPickerModal from "ui/components/modals/NetworkIdentifierPickerModal";

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

export default function ImportToken() {
  const [contractAddress, setContractAddress] = useState("");
  const [symbol, setTokenSymbol] = useState("");
  const [name, setTokenName] = useState("");
  const [decimals, setTokenDecimals] = useState<number | null>(null);
  const [manuallyEdited, setManuallyEdited] = useState(false);
  const [status, setStatus] = useState<{ severity: AlertColor; text: string } | null>(null);
  const [selectedNetworkIdentifier, setSelectedNetworkIdentifier] = useState(ethereumMainnetNetworkIdentifier);

  const [openNetworksModal, setOpenNetworksModal] = useState(false);

  const { trackButtonClicked } = useAnalytics();

  const goBack = useHistoryGoBack();

  const networks = useEnabledNetworks();

  const selectedNetwork = networks?.find(network => network.identifier === selectedNetworkIdentifier);

  const { loading, error, tokenInformation } = useTokenInformation(
    isEthereumAddress(contractAddress) ? contractAddress : null,
    selectedNetwork?.identifier ?? null,
  );

  const handleOpenNetworkModal = () => setOpenNetworksModal(true);
  const handleCloseNetworkModal = () => setOpenNetworksModal(false);

  useEffect(() => {
    if (isEthereumAddress(contractAddress) && !manuallyEdited) {
      if (tokenInformation) {
        setTokenName(tokenInformation.name);
        setTokenSymbol(tokenInformation.symbol);
        setTokenDecimals(tokenInformation.decimals);
      } else {
        setTokenName("");
        setTokenSymbol("");
        setTokenDecimals(null);
      }
    }
  }, [contractAddress, tokenInformation, manuallyEdited]);

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
    setContractAddress(event.target.value);
    setManuallyEdited(false);
  };
  const handleSymbolChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTokenSymbol(event.target.value);
    setManuallyEdited(true);
  };
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTokenName(event.target.value);
    setManuallyEdited(true);
  };
  const handleDecimalsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newDecimals = Number(event.target.value);

    setTokenDecimals(!event.target.value || Number.isNaN(newDecimals) ? null : newDecimals);
    setManuallyEdited(true);
  };
  const handleNetworkSelect = (identifier: string) => {
    if (selectedNetworkIdentifier !== identifier) {
      setManuallyEdited(false);
      setTokenName("");
      setTokenSymbol("");
      setTokenDecimals(null);

      setSelectedNetworkIdentifier(identifier);
    }

    handleCloseNetworkModal();
  };

  const handleImportToken = async () => {
    if (!selectedNetwork || !isEthereumAddress(contractAddress) || decimals === null || !name.trim() || !symbol.trim()) {
      return;
    }

    // TODO: only EVM is case insensitive, for other chains we must not do this
    const sanitizedAddress = String(contractAddress).toLowerCase();

    try {
      setStatus({ severity: "info", text: "Importing token..." });

      const assetIdentifier = getAssetIdentifierFromDefinition({
        type: "contract",
        contractType: "ERC20",
        contractAddress: sanitizedAddress,
      });

      const assetKey = createAssetKey(selectedNetwork.identifier, assetIdentifier);

      const result = await ImportedAsset.ImportNewAsset.perform({
        key: assetKey,
        assetIdentifier,
        networkIdentifier: selectedNetwork.identifier,
        contractType: "ERC20",
        contractAddress: sanitizedAddress,
        type: "token",
        symbol,
        name,
        decimals,
        // We treat user imported assets as trusted, therefore, even if we think they are unverified, we should show it anyway
        visibility: "force-show",
        // Anything the user imports is de-facto verified until our backend confirms otherwise
        verified: true,
        autoImported: false,
      });

      if (result.status === "error") {
        if (result.code === "Duplicate") {
          await ImportedAsset.SetVisibility.perform(assetKey, "force-show", "token");
        } else {
          throw new Error(result.message);
        }
      }

      trackButtonClicked("Imported Token");

      setStatus(null);

      goBack();
    } catch (error) {
      setStatus({ severity: "error", text: error.message });
    }
  };

  const valid = isEthereumAddress(contractAddress) && decimals !== null && name.trim() && symbol.trim();

  return (
    <>
      <Header title="Import Token" onBackClick={goBack} />
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
          label="Token Contract Address"
          value={contractAddress}
          onChange={handleContractAddressChange}
          disabled={status?.severity === "info"}
        />
        <Box mt={2}>
          <FormField label="Token Symbol" value={symbol} onChange={handleSymbolChange} disabled={status?.severity === "info"} />
        </Box>
        <Box mt={2}>
          <FormField label="Token Name" value={name} onChange={handleNameChange} disabled={status?.severity === "info"} />
        </Box>
        <Box mt={2}>
          <FormField
            label="Token Decimals"
            value={String(decimals ?? "")}
            onChange={handleDecimalsChange}
            disabled={status?.severity === "info"}
          />
        </Box>
      </Box>

      <Box flexGrow={1} />

      <Button
        sx={{ mx: 2, mb: 2 }}
        variant="contained"
        disabled={status?.severity === "info" || status?.severity === "error" || !valid}
        onClick={handleImportToken}
      >
        Import Token
      </Button>

      <NetworkIdentifierPickerModal
        open={openNetworksModal}
        onClose={handleCloseNetworkModal}
        current={selectedNetworkIdentifier}
        onSelect={handleNetworkSelect}
      />
    </>
  );
}
