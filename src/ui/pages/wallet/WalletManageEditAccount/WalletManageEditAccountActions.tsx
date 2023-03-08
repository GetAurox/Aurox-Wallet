import { useEffect } from "react";

import { Stack, Button } from "@mui/material";

import { useTimeCounter } from "ui/hooks";

import DefaultControls from "ui/components/controls/DefaultControls";

import { Step } from "./types";

export interface WalletManageEditAccountActionsProps {
  activeStep: Step;
  onSave: () => void;
  confirmPassword: boolean;
  onConfirmPassword: () => void;
  onActiveStep: (step: Step) => void;
}

export default function WalletManageEditAccountActions(props: WalletManageEditAccountActionsProps) {
  const { onSave, activeStep, onActiveStep, confirmPassword, onConfirmPassword } = props;

  const { set, finished, timeLeft } = useTimeCounter();

  useEffect(() => {
    if (activeStep === "privateKeyReveal") {
      set(5);
    }
  }, [activeStep, set]);

  const handleAgree = () => {
    onActiveStep("privateKeyRevealed");
  };

  const handleBack = () => {
    onActiveStep("nameChange");
  };

  const handleCancel = () => {
    onActiveStep("nameChange");
  };

  if (activeStep === "privateKeyReveal") {
    return (
      <DefaultControls
        primary={`I Agree${timeLeft > 0 ? `: ${timeLeft}` : ""}`}
        secondary="Go Back"
        disabledPrimary={!finished}
        onPrimary={handleAgree}
        onSecondary={handleBack}
      />
    );
  }

  return (
    <Stack spacing={1.5} mx={2} flexGrow={1} justifyContent="end" mb={2}>
      {activeStep === "nameChange" && (
        <Button variant="contained" onClick={onSave}>
          Save
        </Button>
      )}
      {activeStep === "passwordConfirm" && (
        <Button variant="contained" onClick={onConfirmPassword} disabled={!confirmPassword}>
          Confirm
        </Button>
      )}
      {activeStep === "privateKeyRevealed" && (
        <Button variant="contained" onClick={handleCancel}>
          Cancel
        </Button>
      )}
    </Stack>
  );
}
