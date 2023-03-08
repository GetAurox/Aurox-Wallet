import { MouseEvent, ReactNode, useState } from "react";

import { Card, CardContent, IconButton, Stack, SxProps, Theme, Typography, Tooltip, Link, Chip } from "@mui/material";
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";

import { AccountInfo } from "common/types";

import { collapseIdentifier, formatBalance, formatPrice, mixSx, TEN_MILLIONS } from "ui/common/utils";
import { useLocalUserPreferences, useGasPrice, useNSResolveDomainFromAddress } from "ui/hooks";

import { IconGasStation } from "ui/components/icons";
import CopyToClipboard from "ui/components/clipboard/CopyToClipboard";
import BlockchainExplorerModal from "ui/components/modals/BlockchainExplorerModal";

import HomeAccountCardConnection from "./HomeAccountCardConnection";

const sxStyles = {
  root: {
    mx: 2,
    borderRadius: 3,
    overflow: "visible",
    "& .MuiCardContent-root:last-child": {
      paddingBottom: "12px",
    },
  },
  cardContent: {
    gap: "6px",
    display: "flex",
    padding: "12px",
    borderRadius: 3,
    alignItems: "stretch",
    flexDirection: "column",
    backgroundColor: "background.default",
    border: (theme: Theme) => `1px solid ${theme.palette.primary.main}`,
  },
  typeLabel: {
    fontSize: "12px",
    textTransform: "capitalize",
  },
};

export interface HomeAccountCardProps {
  account: AccountInfo;
  networkAddress: string;
  portfolioBalanceUSD: number;
  sx?: Pick<Record<keyof typeof sxStyles, SxProps<Theme>>, "root">;
}

export default function HomeAccountCard(props: HomeAccountCardProps) {
  const { account, networkAddress, portfolioBalanceUSD, sx } = props;

  const [openBalanceTooltip, setOpenBalanceTooltip] = useState(false);
  const [isBlockchainExplorerDialogOpen, setIsBlockchainExplorerDialogOpen] = useState(false);

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();
  const { gasPrice } = useGasPrice();

  const { domain, loading: loadingDomain } = useNSResolveDomainFromAddress({ address: networkAddress });

  const handleToggleShowBalance = () => {
    setUserPreferences(preferences => ({ ...preferences, balanceVisible: !preferences.balanceVisible }));
  };

  const handleMouseDownShowBalance = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleBlockchainExplorerDialogOpen = () => {
    setIsBlockchainExplorerDialogOpen(true);
  };

  const handleBlockchainExplorerDialogClose = () => {
    setIsBlockchainExplorerDialogOpen(false);
  };

  const handleOpenBalanceTooltip = () => setOpenBalanceTooltip(true);
  const handleCloseBalanceTooltip = () => setOpenBalanceTooltip(false);

  const showBalance = userPreferences.balanceVisible;

  let domainRender: ReactNode = null;

  if (domain && !loadingDomain) {
    domainRender = (
      <Typography variant="medium" color="text.secondary">
        (
        <Typography component="span" maxWidth={150} overflow="hidden" textOverflow="ellipsis" title={domain}>
          {domain}
        </Typography>
        )
      </Typography>
    );
  }

  let typeLabel: string | null = null;

  if (account.type === "private-key") {
    typeLabel = "imported";
  } else if (account.type === "hardware") {
    typeLabel = account.hardwareType;
  }

  return (
    <>
      <Card sx={mixSx(sxStyles.root, sx?.root)}>
        <CardContent sx={sxStyles.cardContent}>
          <Stack direction="row" justifyContent="space-between">
            <Stack alignItems="end" direction="row" columnGap={1}>
              <Typography variant="headingSmall" lineHeight={1.5} height="24px" fontSize="16px" mt="-1px" color="text.secondary">
                {account.alias ?? ""}
              </Typography>
              {typeLabel && <Chip size="small" sx={sxStyles.typeLabel} label={typeLabel} />}
            </Stack>
            {<HomeAccountCardConnection accountUUID={account.uuid} />}
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="left" gap={0.5} height="20px">
            <Link component="button" onClick={handleBlockchainExplorerDialogOpen} underline="always">
              {collapseIdentifier(networkAddress)}
            </Link>
            <CopyToClipboard text={networkAddress} />
            {domainRender}
          </Stack>

          <Stack direction="row" justifyContent="space-between" mt={0.75}>
            <Stack direction="row" columnGap={0.5} alignItems="center">
              <Tooltip
                arrow
                onOpen={handleOpenBalanceTooltip}
                onClose={handleCloseBalanceTooltip}
                title={formatPrice(portfolioBalanceUSD)}
                open={showBalance && openBalanceTooltip}
              >
                <Typography variant="headingMedium" fontSize="24px" lineHeight="32px">
                  {showBalance ? `$${formatBalance(portfolioBalanceUSD, TEN_MILLIONS)}` : "*****"}
                </Typography>
              </Tooltip>
              <IconButton
                onClick={handleToggleShowBalance}
                aria-label="Toggle balance visibility"
                onMouseDown={handleMouseDownShowBalance}
                sx={{ padding: 0 }}
              >
                {showBalance ? <VisibilityIcon /> : <VisibilityOffIcon />}
              </IconButton>
            </Stack>

            {gasPrice && (
              <Stack direction="row" columnGap={0.5} alignItems="center">
                <IconGasStation />
                <Typography variant="medium">{gasPrice} GWEI</Typography>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
      <BlockchainExplorerModal
        contractAddress={networkAddress}
        open={isBlockchainExplorerDialogOpen}
        onClose={handleBlockchainExplorerDialogClose}
      />
    </>
  );
}
