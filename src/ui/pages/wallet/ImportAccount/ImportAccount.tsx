import { ChangeEvent, FocusEvent, useCallback, useState } from "react";
import { v4 as uuidV4 } from "uuid";

import { Box, Button } from "@mui/material";

import { Wallet } from "common/operations";
import { isValidMnemonicOrPrivateKey } from "common/utils";

import { useAccountAliasGenerator, useBlockingRequest } from "ui/hooks";
import { useGoHome, useHistoryGoBack } from "ui/common/history";

import ConfirmationModal from "ui/components/modals/ConfirmationModal";
import Success from "ui/components/layout/misc/Success";
import Header from "ui/components/layout/misc/Header";
import FormField from "ui/components/form/FormField";

const sxStyles = {
  formField: {
    root: {
      marginTop: "25px",
    },
    helper: {
      "&.MuiFormHelperText-root": {
        color: "error.main",
      },
    },
  },
};

export default function ImportAccount() {
  const goBack = useHistoryGoBack();
  const goHome = useGoHome();

  const [name, setName] = useState("");

  const [generatedAccountName, setGeneratedAccountName] = useState("");

  const [privateKeyOrMnemonic, setPrivateKeyOrMnemonic] = useState("");

  const [showConfirmAlreadyImportedModal, setShowConfirmAlreadyImportedModal] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  useBlockingRequest();

  const accountAliasGenerator = useAccountAliasGenerator();

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const applyPrivateKeyOrMnemonicAndValidate = useCallback((value: string) => {
    setPrivateKeyOrMnemonic(value);

    const isValid = isValidMnemonicOrPrivateKey(value);

    if (isValid === "invalid") {
      setError("Invalid Private Key Or Mnemonic. Try Again");
    } else {
      setError("");
    }
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => applyPrivateKeyOrMnemonicAndValidate(event.target.value);
  const handleBlur = (event: FocusEvent<HTMLInputElement>) => applyPrivateKeyOrMnemonicAndValidate(event.target.value);

  const handleDoImportAccount = useCallback(async () => {
    try {
      setError("");

      const enteredOrGeneratedName = name.trim() ? name : accountAliasGenerator();

      const isValid = isValidMnemonicOrPrivateKey(privateKeyOrMnemonic);

      if (isValid === "mnemonic") {
        await Wallet.ImportMnemonicWallet.perform({
          alias: enteredOrGeneratedName,
          mnemonic: privateKeyOrMnemonic,
        });
      } else {
        await Wallet.ImportPrivateKeySigner.perform({
          alias: enteredOrGeneratedName,
          chainType: "evm",
          privateKey: privateKeyOrMnemonic,
          uuid: uuidV4(),
        });
      }

      setCompleted(true);
      setGeneratedAccountName(enteredOrGeneratedName);
    } catch (error) {
      setError(error.message);
    }
  }, [accountAliasGenerator, name, privateKeyOrMnemonic]);

  const handleImportClick = useCallback(async () => {
    await handleDoImportAccount();
  }, [handleDoImportAccount]);

  const handleHideConfirmAlreadyImportedModal = () => {
    setShowConfirmAlreadyImportedModal(false);
  };

  if (completed) {
    return (
      <Success heading="Complete" subheading={`Your wallet "${generatedAccountName}" was successfully imported.`} onButtonClick={goHome} />
    );
  }

  return (
    <>
      <Header title="Import Wallet" onBackClick={goBack} />
      <Box flex={1} display="flex" flexDirection="column" p={2}>
        <FormField label="Wallet Name" placeholder="Enter Wallet Name" value={name} onChange={handleNameChange} />
        <FormField
          rows={8}
          multiline
          helper={error}
          error={!!error}
          value={privateKeyOrMnemonic}
          autoComplete="off"
          label="Private Key or Mnemonic"
          sx={sxStyles.formField}
          onBlur={handleBlur}
          placeholder="Enter Private Key or Mnemonics"
          onChange={handleChange}
        />
        <Box flexGrow={1} />
        <Button variant="contained" disabled={!privateKeyOrMnemonic || !!error} onClick={handleImportClick}>
          Import
        </Button>
      </Box>
      <ConfirmationModal
        fullWidth
        title="Confirm Import"
        onConfirm={handleDoImportAccount}
        show={showConfirmAlreadyImportedModal}
        onCancel={handleHideConfirmAlreadyImportedModal}
        description="This wallet was already imported. Import this wallet again?"
      />
    </>
  );
}
