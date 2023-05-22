import { Box, Link, Typography } from "@mui/material";

import { TokenTransaction } from "common/types";

import { useActiveAccount, useNetworkBlockchainExplorerLinkResolver, useNetworkByIdentifier } from "ui/hooks";

import { NetworkAvatar } from "../network/NetworkAvatar";

import TokenTransactionActions from "./TokenTransactionActions";

const sxStyles = {
  trxId: {
    width: "45px",
    height: "20px",
    fontSize: "14px",
    direction: "rtl",
    textAlign: "left",
    lineHeight: "20px",
    letterSpacing: "0.25px",
  },
};

export interface TokenTransactionStatusSecondaryProps {
  item: TokenTransaction;
}

export default function TokenTransactionStatusSecondary(props: TokenTransactionStatusSecondaryProps) {
  const { date, status, txHash, networkIdentifier = "", gasless } = props.item;

  const activeAccount = useActiveAccount();

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(networkIdentifier);
  const network = useNetworkByIdentifier(networkIdentifier);

  const txExplorerLink = getTransactionExplorerLink(txHash);

  if (status === "pending" && activeAccount && !gasless) {
    return (
      <TokenTransactionActions accountUUID={activeAccount.uuid} networkIdentifier={networkIdentifier} transactionHash={txHash} mt="7px" />
    );
  }

  return (
    <Box display="flex" height="20px" gap={0.5} alignItems="center" pl="24px" mt="2px">
      <Typography variant="medium" color="text.secondary">
        {date}
      </Typography>{" "}
      <Box width="4px" height="4px" display="flex" justifyContent="center" alignItems="center" component="span" color="#c4c4c4">
        &#8226;
      </Box>{" "}
      {network && <NetworkAvatar size={16} network={network} />}
      <Link
        noWrap
        target="_blank"
        sx={sxStyles.trxId}
        underline={txExplorerLink ? "hover" : "none"}
        color={txExplorerLink ? "primary" : "text.secondary"}
        href={txExplorerLink ?? undefined}
      >
        {txHash}
      </Link>
    </Box>
  );
}
