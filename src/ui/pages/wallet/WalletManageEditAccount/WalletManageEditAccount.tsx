import { ChangeEvent, useState } from "react";

import { ArrowForwardIos as ArrowForwardIosIcon } from "@mui/icons-material";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";

import { Wallet, Password } from "common/operations";

import { useHistoryGoBack, useHistoryPathParams } from "ui/common/history";
import { useAccountAliasGenerator, useAccountByUUID } from "ui/hooks";

import PasswordField from "ui/components/form/PasswordField";
import DialogBase from "ui/components/common/DialogBase";
import Header from "ui/components/layout/misc/Header";
import FormField from "ui/components/form/FormField";
import { IconTrash } from "ui/components/icons";

import { Step } from "./types";

import WalletManageEditAccountActions from "./WalletManageEditAccountActions";

const sxStyles = {
  header: { wrap: { mb: 1.5 } },
  revealButton: {
    color: "text.primary",
    justifyContent: "space-between",
    "&.MuiButton-sizeMedium": {
      borderRadius: 0,
      paddingX: 2,
    },
  },
  arrowIcon: { color: "text.secondary" },

  title: {
    fontWeight: 500,
    fontSize: "24px",
    lineHeight: "32px",
    letterSpacing: "0.18px",
  },
  alert: {
    p: 0,
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "24px",
    color: "text.primary",
    letterSpacing: "0.5px",
    backgroundColor: "transparent",

    "& .MuiAlert-icon": {
      p: 0,
      lineHeight: "24px",
      letterSpacing: "0.5px",
      marginRight: "8px",
    },
    "& .MuiAlert-message": {
      p: 0,
    },
  },
};

const steps: Step[] = ["nameChange", "passwordConfirm", "privateKeyReveal", "privateKeyRevealed"];

export default function WalletManageEditAccount() {
  const { uuid: accountUUID = null } = useHistoryPathParams<"uuid">();

  const goBack = useHistoryGoBack();

  const [activeStep, setActiveStep] = useState<Step>("nameChange");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [password, setPassword] = useState<string>("");
  const [isValidPassword, setIsValidPassword] = useState<boolean | null>(null);

  const [privateKey, setPrivateKey] = useState<string>("");

  const accountAliasGenerator = useAccountAliasGenerator();

  const account = useAccountByUUID(accountUUID);

  const [name, setName] = useState<string>(account?.alias ?? "");

  const cleanupAndGoBack = () => {
    setPassword("");
    setPrivateKey("");

    goBack();
  };

  const handleBack = () => {
    const activeStepIndex = steps.findIndex(step => step === activeStep);

    if (activeStepIndex === 0) {
      cleanupAndGoBack();
    } else {
      setActiveStep(steps[activeStepIndex - 1]);
    }
  };

  const handleActiveStep = (step: Step) => {
    setActiveStep(step);
  };

  const handleReveal = () => {
    setActiveStep("passwordConfirm");
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setIsValidPassword(null);
    setPassword(event.target.value);
  };

  const handlePasswordConfirm = async () => {
    const { valid } = await Password.ProbePassword.perform(password);

    setIsValidPassword(valid);

    if (accountUUID && valid) {
      const { privateKey } = await Wallet.ExportPrivateKey.perform({ uuid: accountUUID, password, chainType: "evm" });

      setPrivateKey(privateKey);
      setActiveStep("privateKeyReveal");
    }
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setName(event.target.value);
  };

  const handleSave = async () => {
    if (accountUUID) {
      await Wallet.SetAlias.perform(accountUUID, name.trim() || accountAliasGenerator());

      cleanupAndGoBack();
    }
  };

  const handleOpenDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (accountUUID) {
      await Wallet.DeleteAccount.perform(accountUUID);

      cleanupAndGoBack();
    }
  };

  return (
    <>
      <Header
        title={`Edit ${account?.alias}`}
        onBackClick={handleBack}
        sx={sxStyles.header}
        closeIcon={<IconTrash />}
        onCloseClick={handleOpenDialog}
      />
      {activeStep === "nameChange" && (
        <>
          <Box mb={2.5} mt="5px" px={2}>
            <FormField label="Name" onChange={handleNameChange} value={name} />
          </Box>
          {account?.type !== "hardware" && (
            <Button
              fullWidth
              variant="text"
              onClick={handleReveal}
              sx={sxStyles.revealButton}
              endIcon={<ArrowForwardIosIcon sx={sxStyles.arrowIcon} fontSize="small" />}
            >
              Reveal Private Key
            </Button>
          )}
        </>
      )}
      {activeStep === "passwordConfirm" && (
        <Stack mx={2} spacing="25px">
          <Typography sx={sxStyles.title}>Confirm Your Password</Typography>
          <PasswordField
            value={password}
            label="Current Password"
            placeholder="Enter Password"
            onChange={handlePasswordChange}
            helper={isValidPassword || isValidPassword === null ? "" : "Invalid password"}
            error={isValidPassword !== null ? !isValidPassword : false}
          />
        </Stack>
      )}
      {activeStep === "privateKeyReveal" && (
        <Stack mx={2} spacing="15px">
          <Typography textAlign="center" sx={sxStyles.title}>
            Warning
          </Typography>
          <Alert sx={sxStyles.alert} severity="warning">
            Make sure nobody is looking at your screen. Don’t share your private key with anyone.
          </Alert>
        </Stack>
      )}
      {activeStep === "privateKeyRevealed" && (
        <Stack mx={2} spacing="15px">
          <Typography sx={sxStyles.title}>Your Private Key</Typography>
          <Alert sx={sxStyles.alert} severity="warning">
            Don’t share your private key with anyone.
          </Alert>
          <FormField rows={8} readOnly multiline value={privateKey} />
        </Stack>
      )}
      <WalletManageEditAccountActions
        onSave={handleSave}
        activeStep={activeStep}
        onActiveStep={handleActiveStep}
        confirmPassword={password.length > 0}
        onConfirmPassword={handlePasswordConfirm}
      />
      <DialogBase
        open={deleteDialogOpen}
        title="You are about to delete a wallet!"
        disablePortal={false}
        onClose={handleCloseDialog}
        actions={
          <>
            <Button variant="outlined" fullWidth autoFocus onClick={handleCloseDialog}>
              No
            </Button>
            <Button variant="contained" fullWidth onClick={handleConfirmDelete}>
              Yes
            </Button>
          </>
        }
        content={
          <Typography variant="medium" textAlign="center">
            Are you sure you want to delete this wallet?
          </Typography>
        }
      />
    </>
  );
}
