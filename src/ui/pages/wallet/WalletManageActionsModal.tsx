import { Button, Stack, Divider } from "@mui/material";

import { HARDWARE_FILENAME } from "common/entities";

import { useHistoryPush } from "ui/common/history";
import useAnalytics from "ui/common/analytics";

import DialogBase from "ui/components/common/DialogBase";

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
  const { trackButtonClicked } = useAnalytics();

  const handleCreateNewWallet = () => {
    trackButtonClicked("Create New Wallet");

    push("/create-account");
  };

  const handleImportWallet = () => {
    trackButtonClicked("Import Wallet");

    push("/import-account");
  };

  const handleImportHardwareWallet = () => {
    trackButtonClicked("Import Hardware Wallet");

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
