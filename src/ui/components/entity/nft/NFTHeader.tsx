import { ListItem, ListItemText, Typography, Box, Link } from "@mui/material";

import { collapseIdentifier } from "ui/common/utils";
import { EthereumAccountTokenContractType } from "ui/types";
import { useNetworkBlockchainExplorerLinkResolver } from "ui/hooks";

import NFTAvatar from "./NFTAvatar";

const sxStyles = {
  nftMainText: {
    fontWeight: 500,
    fontSize: "1rem",
    lineHeight: "12px",
    letterSpacing: "0.15px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  nftMinorText: {
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0.25px",
  },
  itemText: {
    my: 0,
    gap: 0.5,
    display: "flex",
    flexDirection: "column",
  },
};

export interface NFTHeaderProps {
  id: string;
  name: string;
  icon: string;
  tokenAddress: string;
  networkIdentifier: string;
  tokenContractType: EthereumAccountTokenContractType;
}

export default function NFTHeader(props: NFTHeaderProps) {
  const { id, name, icon, tokenAddress, networkIdentifier, tokenContractType } = props;

  const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(networkIdentifier);

  const link = getContractAddressExplorerLink(tokenAddress);

  return (
    <ListItem sx={{ px: 0 }}>
      <NFTAvatar src={icon} alt={name} styles={{ width: 52, height: 52, ml: 0 }}>
        {name?.charAt(0)}
      </NFTAvatar>
      <ListItemText
        disableTypography
        sx={sxStyles.itemText}
        primary={
          <Typography sx={sxStyles.nftMainText} color="text.primary">
            {name}
            {id ? `- ${id}` : ""}
          </Typography>
        }
        secondary={
          <Box display="flex" gap={1.5} alignItems="center">
            <Typography variant="medium" color="text.secondary">
              {tokenContractType}
            </Typography>
            <Typography sx={sxStyles.nftMinorText} color="text.secondary">
              <Link href={link ?? undefined} target="_blank" sx={{ textDecoration: "none" }}>
                ({collapseIdentifier(tokenAddress)})
              </Link>
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}
