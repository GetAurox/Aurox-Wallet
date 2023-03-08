import { useState, ChangeEvent } from "react";

import { Box, Button, Stack, Typography } from "@mui/material";

import { Password } from "common/operations";

import { useHistoryGoBack } from "ui/common/history";

import Header from "ui/components/layout/misc/Header";
import { IconStatusWarning } from "ui/components/icons";
import PasswordField from "ui/components/form/PasswordField";
import CustomControls from "ui/components/controls/CustomControls";
import DefaultControls from "ui/components/controls/DefaultControls";
import ConfirmationModal from "ui/components/modals/ConfirmationModal";

type ResetWalletStep = "confirm-password" | "reset";

const sxStyles = {
  passwordField: {
    helper: {
      "&.MuiFormHelperText-root": {
        color: "error.main",
      },
    },
  },
};

export default function ResetWallet() {
  const [step, setStep] = useState<ResetWalletStep>("confirm-password");
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const goBack = useHistoryGoBack();

  const [password, setPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordError("");
  };

  const handlePasswordConfirm = async () => {
    if (!password) {
      return;
    }

    const { valid } = await Password.ProbePassword.perform(password);

    if (!valid) {
      setPasswordError("Wrong Password");
      return;
    }

    setStep("reset");
  };

  const handlePasswordClear = () => {
    setPassword("");
    setPasswordError("");
  };

  const handleOpenConfirmModal = () => {
    setOpenConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setOpenConfirmModal(false);
  };

  const handleConfrimReset = () => {
    chrome.storage.local.clear();
    chrome.storage.session.clear();
    chrome.storage.sync.clear();

    handleCloseConfirmModal();

    chrome.runtime.reload();
  };

  return (
    <>
      <Header title="Reset Your Wallet" onBackClick={goBack} />

      {step === "confirm-password" && (
        <>
          <Stack p={2}>
            <Typography fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px" mb={3}>
              Confirm Your Password
            </Typography>
            <PasswordField
              value={password}
              error={!!passwordError}
              label="Current Password"
              sx={sxStyles.passwordField}
              placeholder="Enter Password"
              onClear={handlePasswordClear}
              onChange={handlePasswordChange}
              visibilityControl={password !== ""}
              helper={passwordError && passwordError}
            />
          </Stack>

          <DefaultControls onPrimary={handlePasswordConfirm} primary="Confirm" disabledPrimary={password === ""} />
        </>
      )}

      {step === "reset" && (
        <>
          <Stack p={2} rowGap={2}>
            <Typography fontWeight={500} fontSize="20px" lineHeight="32px" letterSpacing="0.18px">
              Are you sure you want to reset your wallet?
            </Typography>
            <Stack direction="row">
              <Box>
                <IconStatusWarning fontSize="small" color="warning" />
              </Box>
              <Typography fontSize="16px" ml={1}>
                This action is not reversible. It will delete all mnemonics, private keys and settings in your wallet. Please make sure you
                have backed up your mnemonic and/or private keys before you proceed.
              </Typography>
            </Stack>
          </Stack>
          <CustomControls
            secondary={
              <Button fullWidth variant="outlined" color="error" onClick={handleOpenConfirmModal}>
                Reset My Wallet
              </Button>
            }
            primary={
              <Button fullWidth variant="contained" color="primary" onClick={goBack}>
                Cancel
              </Button>
            }
          />
        </>
      )}
      <ConfirmationModal
        fullWidth
        cancelText="No"
        confrimText="Yes"
        title="Are you sure?"
        show={openConfirmModal}
        onConfirm={handleConfrimReset}
        onCancel={handleCloseConfirmModal}
        description="This action is not reversible and will clear out all your settings, including your mnemonic/private keys."
      />
    </>
  );
}
