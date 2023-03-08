import { Button, Typography } from "@mui/material";

import DialogBase from "ui/components/common/DialogBase";

export interface WalletManageHiddenWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WalletManageHiddenWalletModal(props: WalletManageHiddenWalletModalProps) {
  const { isOpen, onClose, onConfirm } = props;

  return (
    <DialogBase
      open={isOpen}
      onClose={onClose}
      title="Hidden Wallet"
      content={
        <Typography variant="large" textAlign="center">
          This wallet is hidden and to access it, you have to make it visible again. Do you want to make it visible?
        </Typography>
      }
      actions={
        <>
          <Button fullWidth variant="outlined" onClick={onClose}>
            No
          </Button>
          <Button fullWidth variant="contained" onClick={onConfirm}>
            Yes
          </Button>
        </>
      }
    />
  );
}
