import { useMemo } from "react";

import { Theme, Box, Typography, Checkbox, Link, Stack } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

import { applyTokenAssetVisibilityRules, getBlockchainExplorerContractAddressLink } from "common/utils";
import { ImportHardwareSigner } from "common/operations/Wallet";

import { useAccountFlatTokenBalances, useAccountPortfolioUSDValue, useEnabledNetworks, useTokensDisplay } from "ui/hooks";
import { formatPrice } from "ui/common/utils";

import TokenIconDisplay from "ui/components/entity/token/TokenIconDisplay";
import CopyableText from "ui/components/clipboard/CopyableText";
import { NetworkAvatar } from "ui/components/entity/network/NetworkAvatar";

interface TableHeaderProps {
  onClickCheckAll: () => void;
  isAllChecked: boolean;
  isImportedWalletTab?: boolean;
}

const thStyle = {
  root: {
    width: "100%",
    minWidth: "720px",
    display: "flex",
    alignItems: "center",
    marginBottom: "8px",
    height: "42px",
  },
  row: { marginLeft: "15px", width: "100%", justifyContent: "space-around", alignItems: "center" },
};

function TableHeader(props: TableHeaderProps) {
  const { onClickCheckAll, isAllChecked, isImportedWalletTab = false } = props;

  return (
    <Box sx={thStyle.root}>
      {!isImportedWalletTab ? <Checkbox checked={isAllChecked} onChange={onClickCheckAll} /> : <Box sx={{ width: "45px" }} />}
      <Box display="flex" sx={thStyle.row}>
        <Box width="140px">
          <Typography color="text.secondary">Address</Typography>
        </Box>
        {isImportedWalletTab && (
          <Box width="130px">
            <Typography color="text.secondary">Name</Typography>
          </Box>
        )}
        <Box width="170px">
          <Typography color="text.secondary">Amount</Typography>
        </Box>
        <Box width="188px">
          <Typography align="center" color="text.secondary">
            Coins
          </Typography>
        </Box>
        <Box width="188px">
          <Typography align="center" color="text.secondary">
            Explorers
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

interface TableRowProps {
  wallet: ImportHardwareSigner.Data;
  isChecked: boolean;
  onClickCheck: () => void;
  isImportedWalletTab?: boolean;
}

const trStyle = {
  root: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    minWidth: "720px",
    height: "44px",
    mb: 1,
    borderWidth: "1px",
    borderType: "solid",
    borderRadius: "12px",
    cursor: "pointer",
  },
  checkWrap: { display: "flex", minWidth: "42px", justifyContent: "center" },
  row: { ml: "15px", width: "100%", justifyContent: "space-around", alignItems: "center" },
  typo: { width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
};

function TableRow(props: TableRowProps) {
  const { wallet, isChecked, onClickCheck, isImportedWalletTab = false } = props;

  const accountBalance = useAccountFlatTokenBalances(wallet.uuid);
  const accountPortfolioUSDValue = useAccountPortfolioUSDValue(wallet.uuid);

  const visibleAccountBalance = useMemo(() => accountBalance.filter(applyTokenAssetVisibilityRules), [accountBalance]);

  const tokens = useTokensDisplay(visibleAccountBalance);
  const networks = useEnabledNetworks();

  return (
    <Box
      onClick={!isImportedWalletTab ? onClickCheck : undefined}
      sx={{ ...trStyle.root, borderColor: (theme: Theme) => (isChecked ? theme.palette.primary.main : theme.palette.custom.grey["19"]) }}
      border={(theme: Theme) => (isChecked ? `1px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.custom.grey["19"]}`)}
    >
      {!isImportedWalletTab ? (
        <Box sx={trStyle.checkWrap}>
          {isChecked ? <CheckBoxIcon sx={{ color: "primary.main" }} /> : <CheckBoxOutlineBlankIcon sx={{ color: "text.secondary" }} />}
        </Box>
      ) : (
        <Box width="42px" />
      )}
      <Box display="flex" sx={trStyle.row}>
        <Box width="140px">
          <CopyableText text={wallet.address} justifyContent="space-between" width="110px" />
        </Box>
        {isImportedWalletTab && (
          <Box width="130px">
            <Typography sx={{ width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
              {wallet.alias}
            </Typography>
          </Box>
        )}
        <Box width="170px" pr="20px">
          <Typography sx={trStyle.typo}>{`$ ${formatPrice(accountPortfolioUSDValue ?? 0)}`}</Typography>
        </Box>
        <TokenIconDisplay tokens={tokens} width="188px" overflow="hidden" alignItems="center" justifyContent="center" />
        <Stack direction="row" columnGap={0.5} width="188px" overflow="hidden" alignItems="center" justifyContent="center">
          {networks?.map(network => {
            const link = getBlockchainExplorerContractAddressLink(wallet.address, network.chainExplorer?.baseURL ?? null);

            return (
              <Link key={network.identifier} href={link ?? undefined} target="_blank" rel="noopener" underline="none">
                <NetworkAvatar size={20} network={network} />
              </Link>
            );
          })}
        </Stack>
      </Box>
    </Box>
  );
}

export interface WalletTableProps {
  wallets: ImportHardwareSigner.Data[];
  selectedWallets: ImportHardwareSigner.Data[];
  onClickCheckAll: () => void;
  onClickCheck: (wallet: ImportHardwareSigner.Data) => void;
  isImportedWalletTab?: boolean;
}

export default function WalletTable(props: WalletTableProps) {
  const { wallets, selectedWallets, onClickCheckAll, onClickCheck, isImportedWalletTab = false } = props;

  const isAllChecked = wallets.length === selectedWallets.length;

  return (
    <Box width="100%">
      <TableHeader onClickCheckAll={onClickCheckAll} isImportedWalletTab={isImportedWalletTab} isAllChecked={isAllChecked} />
      {wallets.map(wallet => {
        const isChecked = selectedWallets.indexOf(wallet) !== -1;
        return (
          <TableRow
            key={wallet.address}
            wallet={wallet}
            isChecked={isChecked}
            onClickCheck={() => onClickCheck(wallet)}
            isImportedWalletTab={isImportedWalletTab}
          />
        );
      })}
    </Box>
  );
}
