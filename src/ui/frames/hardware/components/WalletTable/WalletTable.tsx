import { Box } from "@mui/material";

import { ImportHardwareSigner } from "common/operations/Wallet";

import TableHeader from "./TableHeader";
import TableRowExternal from "./TableRowExternal";
import TableRowImported from "./TableRowImported";

export interface WalletTableProps {
  onClickCheckAll: () => void;
  isImportedWalletTab?: boolean;
  wallets: ImportHardwareSigner.Data[];
  selectedWallets: ImportHardwareSigner.Data[];
  onClickCheck: (wallet: ImportHardwareSigner.Data) => void;
}

export default function WalletTable(props: WalletTableProps) {
  const { wallets, selectedWallets, onClickCheckAll, onClickCheck, isImportedWalletTab = false } = props;

  const handleTableRowExternalClickCheck = (wallet: ImportHardwareSigner.Data) => {
    onClickCheck(wallet);
  };

  const isAllChecked = wallets.length === selectedWallets.length;

  return (
    <Box width="100%">
      <TableHeader onClickCheckAll={onClickCheckAll} isImportedWalletTab={isImportedWalletTab} isAllChecked={isAllChecked} />
      {wallets.map(wallet => {
        const isChecked = selectedWallets.indexOf(wallet) !== -1;

        if (isImportedWalletTab) {
          return <TableRowImported key={wallet.address} wallet={wallet} isChecked={isChecked} />;
        }

        return (
          <TableRowExternal key={wallet.address} wallet={wallet} isChecked={isChecked} onClickCheck={handleTableRowExternalClickCheck} />
        );
      })}
    </Box>
  );
}
