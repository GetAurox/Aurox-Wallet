import { Button, Typography } from "@mui/material";
import React from "react";
import DialogBase from "ui/components/common/DialogBase";

export interface ConfirmCancelSwapModalProps {
  open: boolean;
  onCancel: () => void;
}

export const ConfirmCancelSwapModal = (props: ConfirmCancelSwapModalProps) => {
  const { open, onCancel } = props;

  return (
    <DialogBase
      title={
        <Typography variant="headingSmall" mx={2} mt={2} lineHeight="28px" textAlign="center">
          Please make sure to also cancel any pending transaction on your hardware wallet. Failure to do so can lead to loss of funds
        </Typography>
      }
      onClose={onCancel}
      open={open}
      actions={
        <Button fullWidth variant="contained" onClick={onCancel}>
          I understand
        </Button>
      }
    />
  );
};
