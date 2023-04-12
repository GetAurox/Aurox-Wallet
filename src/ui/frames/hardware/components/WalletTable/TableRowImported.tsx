import { useMemo } from "react";

import { Box, Link, Stack, Theme, Typography } from "@mui/material";

import { ImportHardwareSigner } from "common/operations/Wallet";
import { applyTokenAssetVisibilityRules, getBlockchainExplorerContractAddressLink } from "common/utils";

import { formatPrice } from "ui/common/utils";
import { useAccountFlatTokenBalances, useAccountPortfolioUSDValue, useEnabledNetworks, useTokensDisplay } from "ui/hooks";

import CopyableText from "ui/components/clipboard/CopyableText";
import { NetworkAvatar } from "ui/components/entity/network/NetworkAvatar";
import TokenIconDisplay from "ui/components/entity/token/TokenIconDisplay";

const sxStyles = {
  root: {
    mb: 1,
    width: "100%",
    height: "44px",
    display: "flex",
    minWidth: "720px",
    cursor: "pointer",
    borderWidth: "1px",
    borderType: "solid",
    alignItems: "center",
    borderRadius: "12px",
  },
  checkWrap: { display: "flex", minWidth: "42px", justifyContent: "center" },
  row: { ml: "15px", width: "100%", justifyContent: "space-around", alignItems: "center" },
  typo: { width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
  alias: { width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" },
};

interface TableRowImportedProps {
  isChecked: boolean;
  wallet: ImportHardwareSigner.Data;
}

export default function TableRowImported(props: TableRowImportedProps) {
  const { wallet, isChecked } = props;

  const accountBalance = useAccountFlatTokenBalances(wallet.uuid);
  const accountPortfolioUSDValue = useAccountPortfolioUSDValue(wallet.uuid);

  const visibleAccountBalance = useMemo(() => accountBalance.filter(applyTokenAssetVisibilityRules), [accountBalance]);

  const tokens = useTokensDisplay(visibleAccountBalance);
  const networks = useEnabledNetworks();

  return (
    <Box
      sx={{ ...sxStyles.root, borderColor: (theme: Theme) => (isChecked ? theme.palette.primary.main : theme.palette.custom.grey["19"]) }}
      border={(theme: Theme) => `1px solid ${isChecked ? theme.palette.primary.main : theme.palette.custom.grey["19"]}`}
    >
      <Box width="42px" />

      <Box display="flex" sx={sxStyles.row}>
        <Box width="140px">
          <CopyableText text={wallet.address} justifyContent="space-between" width="110px" />
        </Box>

        <Box width="130px">
          <Typography sx={sxStyles.alias}>{wallet.alias}</Typography>
        </Box>

        <Box width="170px" pr="20px">
          <Typography sx={sxStyles.typo}>{`$ ${formatPrice(accountPortfolioUSDValue ?? 0)}`}</Typography>
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
