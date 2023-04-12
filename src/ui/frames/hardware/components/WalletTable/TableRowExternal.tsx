import { useMemo } from "react";

import { Box, Link, Stack, Theme, Typography } from "@mui/material";
import { CheckBox as CheckBoxIcon, CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon } from "@mui/icons-material";

import { ImportHardwareSigner } from "common/operations/Wallet";
import { applyTokenAssetVisibilityRules, getBlockchainExplorerContractAddressLink } from "common/utils";

import { formatPrice } from "ui/common/utils";
import { useEnabledNetworks, useTokensDisplay } from "ui/hooks";

import CopyableText from "ui/components/clipboard/CopyableText";
import { NetworkAvatar } from "ui/components/entity/network/NetworkAvatar";
import TokenIconDisplay from "ui/components/entity/token/TokenIconDisplay";

import { useAccountTokenExternalBalance } from "../../hooks";

interface TableRowExternalProps {
  isChecked: boolean;
  wallet: ImportHardwareSigner.Data;
  onClickCheck: (wallet: ImportHardwareSigner.Data) => void;
}

const sxStyles = {
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
    backgroundColor: "transparent",
  },
  checkWrap: { display: "flex", minWidth: "42px", justifyContent: "center" },
  row: { ml: "15px", width: "100%", justifyContent: "space-around", alignItems: "center" },
  typo: { color: "white" },
};

export default function TableRowExternal(props: TableRowExternalProps) {
  const { wallet, isChecked, onClickCheck } = props;

  const accountBalance = useAccountTokenExternalBalance(wallet.address);

  const accountPortfolioUSDValue = accountBalance.totalUSDValue;

  const visibleAccountBalance = useMemo(() => accountBalance.balances.filter(applyTokenAssetVisibilityRules), [accountBalance]);

  const tokens = useTokensDisplay(visibleAccountBalance);
  const networks = useEnabledNetworks();

  const handleClick = () => {
    onClickCheck(wallet);
  };

  return (
    <Box
      component="button"
      onClick={handleClick}
      sx={{ ...sxStyles.root, borderColor: (theme: Theme) => (isChecked ? theme.palette.primary.main : theme.palette.custom.grey["19"]) }}
      border={(theme: Theme) => (isChecked ? `1px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.custom.grey["19"]}`)}
    >
      <Box sx={sxStyles.checkWrap}>
        {isChecked ? <CheckBoxIcon sx={{ color: "primary.main" }} /> : <CheckBoxOutlineBlankIcon sx={{ color: "text.secondary" }} />}
      </Box>

      <Box display="flex" sx={sxStyles.row}>
        <Box width="140px">
          <CopyableText text={wallet.address} justifyContent="space-between" width="110px" />
        </Box>

        <Box width="170px" pr="20px">
          <Typography noWrap sx={sxStyles.typo}>{`$ ${formatPrice(accountPortfolioUSDValue ?? 0)}`}</Typography>
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
