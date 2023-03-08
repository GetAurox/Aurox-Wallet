import { useState } from "react";

import { Box, Collapse, Button, Typography, Stack } from "@mui/material";

import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

import { TokenTransactionSide, TransactionStatus } from "common/types";

import { useNetworkBlockchainExplorerLinkResolver, useNetworkByIdentifier } from "ui/hooks";
import { formatAmount } from "ui/common/utils";

import IconExpandMore from "ui/components/styled/IconExpandMore";
import CopyableLink from "ui/components/clipboard/CopyableLink";
import { NetworkAvatar } from "ui/components/entity/network/NetworkAvatar";

const sxStyles = {
  advancedButton: {
    gridArea: "3 / 1 / 4 / 3",
  },
  advancedCollapse: {
    "& .MuiCollapse-wrapperInner": {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gridTemplateRows: "repeat(3, 1fr)",
      gap: 1.5,
    },
  },
  linkButton: {
    padding: 0,
    minWidth: "inherit",
    "& .MuiButton-text": {
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0.25px",
    },
  },
  copyIconButton: {
    padding: 0,
  },
};

export interface TransactionTokenSectionAdvancedProps {
  txHash: string;
  side?: TokenTransactionSide;
  symbol?: string;
  gasPrice: string;
  gasLimit: string;
  nonce: number | string;
  networkIdentifier: string;
  showAdvanced?: boolean;
  status: TransactionStatus | null;
}

export default function TransactionTokenSectionAdvanced(props: TransactionTokenSectionAdvancedProps) {
  const { txHash, side, symbol, gasLimit, gasPrice, nonce, networkIdentifier, showAdvanced, status } = props;

  const [expanded, setExpanded] = useState(false);

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(networkIdentifier);
  const network = useNetworkByIdentifier(networkIdentifier);

  const txExplorerLink = getTransactionExplorerLink(txHash);

  const handleExpandClick = () => setExpanded(value => !value);

  return (
    <>
      <Box gap={1.5} display="grid" alignItems="center" component="section" gridTemplateRows="auto" gridTemplateColumns="repeat(2, 1fr)">
        {side === "swap" && (
          <>
            <Typography variant="medium" color="text.secondary">
              Swapped to:
            </Typography>
            <Typography variant="medium" textAlign="right">
              {symbol}
            </Typography>
          </>
        )}
        <Typography variant="medium" whiteSpace="nowrap" color="text.secondary">
          Blockchain Transaction ID:
        </Typography>
        <Stack direction="row" columnGap={0.5} justifyContent="end">
          {network && <NetworkAvatar size={20} network={network} />}
          <CopyableLink link={txExplorerLink} text={txHash} />
        </Stack>

        {showAdvanced && (
          <Button
            sx={sxStyles.advancedButton}
            variant="text"
            endIcon={<IconExpandMore expand={expanded} Icon={ExpandMoreIcon} aria-expanded={expanded} aria-label="show more" />}
            onClick={handleExpandClick}
          >
            <Typography fontSize="16px" lineHeight="20px" letterSpacing="0.25" textAlign="center" color="primary.main">
              Advanced
            </Typography>
          </Button>
        )}
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit sx={sxStyles.advancedCollapse}>
        <Typography variant="medium" color="text.secondary">
          Nonce:
        </Typography>
        <Typography variant="medium" textAlign="right">
          {nonce}
        </Typography>
        <Typography variant="medium" color="text.secondary">
          Gas Limit (Units):
        </Typography>
        <Typography variant="medium" textAlign="right">
          {formatAmount(gasLimit ?? 0)}
        </Typography>
        <Typography variant="medium" color="text.secondary">
          Gas Price (GWEI):
        </Typography>
        <Typography variant="medium" textAlign="right">
          {status !== "pending" ? formatAmount(gasPrice ?? 0) : "Pending"}
        </Typography>
      </Collapse>
    </>
  );
}
