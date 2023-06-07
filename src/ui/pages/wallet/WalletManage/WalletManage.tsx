import { useMemo, useState } from "react";

import { Add as AddIcon } from "@mui/icons-material";
import { Fab, Stack, Typography } from "@mui/material";

import { AccountInfo } from "common/types";
import { Wallet } from "common/operations";
import { getAccountAddressForChainType } from "common/utils";

import { useAccountsVisibleOrdered, useCurrentTabDappConnectionInfo, useWalletPortfolioUSDValue } from "ui/hooks";

import { useHistoryGoBack } from "ui/common/history";
import useAnalytics from "ui/common/analytics";
import { formatPrice } from "ui/common/utils";

import AccountManageItem from "ui/components/entity/account/AccountManageItem";
import FixedPanel from "ui/components/layout/misc/FixedPanel";
import CheckboxField from "ui/components/form/CheckboxField";
import Header from "ui/components/layout/misc/Header";

import { WalletManageActionsModal } from "../WalletManageActionsModal";

import WalletManageWarningModal from "./WalletManageWarningModal";
import WalletManageHiddenWalletModal from "./WalletManageHiddenWalletModal";

const sxStyles = {
  checkbox: {
    checkbox: {
      "&.MuiCheckbox-root": {
        width: "20px",
        margin: "-8px 3px 0 0",
      },
    },
  },
};

type ModalType = "action" | "warning" | "hidden-wallet";

export default function WalletManage() {
  const [showHidden, setShowHidden] = useState(false);
  const [modal, setModal] = useState<ModalType | null>(null);
  const [pendingAccount, setPendingAccount] = useState<AccountInfo | null>(null);

  const goBack = useHistoryGoBack();

  const { trackButtonClicked } = useAnalytics();

  const accounts = useAccountsVisibleOrdered(showHidden);

  const { isDAppConnected, connection } = useCurrentTabDappConnectionInfo();

  const walletPortfolioUSDValue = useWalletPortfolioUSDValue(showHidden);

  const visibleAccounts = useMemo(() => accounts?.filter(account => !account.hidden) ?? [], [accounts]);

  const handleModalClose = () => setModal(null);

  const handleModalOpen = (modal: ModalType) => setModal(modal);

  const handleActionsModalOpen = () => handleModalOpen("action");

  const handleHiddenWalletModalConfirm = async () => {
    if (pendingAccount) {
      await Wallet.SetHidden.perform(pendingAccount.uuid, false);
      await Wallet.SwitchAccount.perform(pendingAccount.uuid);

      setPendingAccount(null);
    }

    goBack();
  };

  const toggleHiddenWallets = () => {
    setShowHidden(value => !value);

    trackButtonClicked("Show Hidden Wallets");
  };

  const handleHide = async (account: AccountInfo) => {
    const currentlyHidden = account.hidden ?? false;
    const isLastUnhidden = showHidden ? visibleAccounts.length === 1 : accounts?.length === 1;

    if (!currentlyHidden && isLastUnhidden) {
      handleModalOpen("warning");

      return;
    }

    await Wallet.SetHidden.perform(account.uuid, !currentlyHidden);

    trackButtonClicked(currentlyHidden ? "Unhide Wallet" : "Hide Wallet");
  };

  const handleItemClick = async (account: AccountInfo) => {
    if (account.hidden) {
      setPendingAccount(account);
      handleModalOpen("hidden-wallet");

      return;
    }

    await Wallet.SwitchAccount.perform(account.uuid);

    goBack();
  };

  return (
    <>
      <Header title="Manage Wallets" onBackClick={goBack} />
      <Stack component="section" alignItems="center" justifyContent="space-between">
        <Typography variant="medium" color="text.secondary">
          Your total portfolio balance
        </Typography>
        <Typography color="text.primary" fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px">
          ${formatPrice(walletPortfolioUSDValue ?? 0)}
        </Typography>
      </Stack>

      <Stack flexDirection="row" justifyContent="space-between" mt={1}>
        <Typography variant="medium" color="text.primary" mb={1} ml={2}>
          Select a Wallet
        </Typography>

        <CheckboxField
          label={
            <Typography variant="medium" mb={1} mr={2}>
              Show Hidden Wallets
            </Typography>
          }
          value={showHidden}
          sx={sxStyles.checkbox}
          onChange={toggleHiddenWallets}
        />
      </Stack>

      <Stack component="ul" px={2} rowGap={1.5}>
        {!accounts && (
          <Typography textAlign="center" color="text.primary">
            You have no wallets
          </Typography>
        )}
        {accounts?.map(account => {
          const address = getAccountAddressForChainType(account, "evm");

          return (
            <AccountManageItem
              key={address}
              account={account}
              onHide={handleHide}
              addressDisplay={address}
              onClick={handleItemClick}
              isConnected={!!isDAppConnected && connection?.accountUUID === account.uuid}
            />
          );
        })}
      </Stack>
      <FixedPanel variant="bottom" disablePortal display="flex" justifyContent="end" width="auto" right="0">
        <Fab color="primary" sx={{ mr: 2, mb: 2 }} onClick={handleActionsModalOpen}>
          <AddIcon />
        </Fab>
      </FixedPanel>
      <WalletManageActionsModal isOpen={modal === "action"} onClose={handleModalClose} />
      <WalletManageWarningModal isOpen={modal === "warning"} onClose={handleModalClose} onOk={handleModalClose} />
      <WalletManageHiddenWalletModal
        onClose={handleModalClose}
        isOpen={modal === "hidden-wallet"}
        onConfirm={handleHiddenWalletModalConfirm}
      />
    </>
  );
}
