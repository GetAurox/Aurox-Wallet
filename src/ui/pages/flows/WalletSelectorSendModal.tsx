import { Dialog, Stack, Typography, Button } from "@mui/material";

import Header from "ui/components/layout/misc/Header";
import { useActiveAccount, useConsolidatedAccountsInfo } from "ui/hooks";

import ConnectAccountOptions from "../dapp/Connect/ConnectAccountOptions";

export interface WalletSelectorSendModalProps {
  onSelect: (wallet: string) => void;
  open: boolean;
  onClose: () => void;
}

export default function WalletSelectorSendModal(props: WalletSelectorSendModalProps) {
  const { onSelect, open, onClose } = props;

  const accounts = useConsolidatedAccountsInfo("evm");
  const activeAccount = useActiveAccount();

  const handleSelect = (uuid: string) => {
    const accountAddress = accounts?.find(account => account.uuid === uuid)?.address;

    if (!accountAddress) {
      console.error("Could not find account address for uuid", uuid);
      return;
    }

    onSelect(accountAddress);
  };

  return (
    <Dialog open={open} fullScreen>
      <Header onBackClick={onClose} title={`Send from ${activeAccount?.alias}`} />
      <Stack mx={2} rowGap={1.5}>
        <Typography variant="headingSmall">Select a wallet to transfer to:</Typography>
        {accounts
          ?.filter(account => account.uuid !== activeAccount?.uuid)
          .map(account => (
            <ConnectAccountOptions component={Button} key={account.uuid} account={account} onSelect={handleSelect} />
          ))}
      </Stack>
    </Dialog>
  );
}
