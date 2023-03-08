import { useHistoryPush } from "ui/common/history";

import { Button, Stack, Divider } from "@mui/material";

import DialogBase from "ui/components/common/DialogBase";

import { HARDWARE_FILENAME } from "common/entities";

const sxStyles = {
  actionButton: {
    "&.MuiButton-sizeMedium": {
      py: 3,
      px: 1.5,
      fontWeight: 500,
      borderRadius: 0,
      fontSize: "17px",
      lineHeight: "20px",
      color: "text.primary",
      justifyContent: "flex-start",
    },
  },
  dialog: {
    content: {
      "&.MuiDialogContent-root": { px: 0 },
    },
  },
};

export interface ActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletManageActionsModal = (props: ActionsModalProps) => {
  const { isOpen, onClose } = props;

  const push = useHistoryPush();

  const handleCreateNewWallet = () => {
    push("/create-account");
  };

  const handleImportWallet = () => {
    push("/import-account");
  };

  const handleImportHardwareWallet = () => {
    chrome.tabs.create({ url: HARDWARE_FILENAME });
  };

  return (
    <DialogBase
      open={isOpen}
      onClose={onClose}
      title="Add Wallet"
      sxContent={sxStyles.dialog.content}
      content={
        <Stack component="section">
          <Button variant="text" sx={sxStyles.actionButton} onClick={handleCreateNewWallet}>
            Create a New Wallet
          </Button>
          <Divider variant="middle" />
          <Button variant="text" sx={sxStyles.actionButton} onClick={handleImportWallet}>
            Import Wallet
          </Button>
          <Divider variant="middle" />
          <Button variant="text" sx={sxStyles.actionButton} onClick={handleImportHardwareWallet}>
            Import Hardware Wallet
          </Button>
        </Stack>
      }
    />
  );
};
