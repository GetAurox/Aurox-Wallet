import { Button, Typography } from "@mui/material";

import DialogBase from "ui/components/common/DialogBase";

export interface WalletManageWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOk: () => void;
}

export default function WalletManageWarningModal(props: WalletManageWarningModalProps) {
  const { isOpen, onClose, onOk } = props;

  return (
    <DialogBase
      open={isOpen}
      title="Warning"
      onClose={onClose}
      content={
        <Typography variant="large" textAlign="center">
          You must have at least one wallet that is not hidden
        </Typography>
      }
      actions={
        <Button fullWidth variant="contained" onClick={onOk}>
          Ok
        </Button>
      }
    />
  );
}
