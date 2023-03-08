import { useEffect } from "react";

import { Avatar, Box, Card, CardContent, CardMedia, Typography } from "@mui/material";

import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

import { EthereumAccountNFT } from "ui/types";
import { useHistoryGoBack } from "ui/common/history";
import { collapseIdentifier } from "ui/common/utils";
import { useHasScrollOverflowObserver, useNetworkBlockchainExplorerLinkResolver } from "ui/hooks";

import Header from "ui/components/layout/misc/Header";
import { IconPlaceholderNFT } from "ui/components/icons";
import CopyableLink from "ui/components/clipboard/CopyableLink";

const sxStyles = {
  card: {
    padding: "13px 16px 0 16px",
    backgroundColor: "transparent",
    backgroundImage: "none",
  },
  cardMedia: {
    borderRadius: "10px",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: 0.25,
    padding: "22px 0px 0px 0px",
    "&:last-child": {
      paddingBottom: "23px",
    },
  },
  transactionInfo: {
    display: "flex",
    gap: 0.5,
    alignItems: "center",
    marginBottom: "14px",
    marginTop: "-3px",
  },
};

export interface NFTTokenCardProps {
  nft: EthereumAccountNFT | null;
}

export default function NFTTokenCard(props: NFTTokenCardProps) {
  const { nft } = props;

  const goBack = useHistoryGoBack();

  const hasScrollOverflowObserver = useHasScrollOverflowObserver();
  // TODO: uncomment once nft has networkIdentifier
  // const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(nft.networkIdentifier);

  const tokenId = nft?.tokenId;
  const image = nft?.metadata?.imageUrl;
  const name = nft?.metadata?.name ?? nft?.token?.name;

  let title = "Error: Unable to get NFT information";
  // const link = getContractAddressExplorerLink(nft.contractAddress);

  if (tokenId && name) {
    title = `${name} #${hasScrollOverflowObserver.overflow.isHorizontal ? collapseIdentifier(tokenId) : tokenId}`;
  }

  const preferredNetwork = "ERC721";
  const tokenAddress = nft?.tokenAddress;

  useEffect(() => {
    if (hasScrollOverflowObserver.overflow.isHorizontal) {
      hasScrollOverflowObserver.ref(null);
    }
  }, [hasScrollOverflowObserver]);

  return (
    <>
      <Header title={title} onBackClick={goBack} />
      <Card sx={sxStyles.card}>
        {image ? (
          <CardMedia
            alt={title}
            image={image}
            component="img"
            sx={sxStyles.cardMedia}
            width={DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS}
            height={DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS}
          />
        ) : (
          <Avatar
            variant="square"
            sx={{ height: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS, width: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS, borderRadius: "10px" }}
          >
            <IconPlaceholderNFT width={DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS} height={DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS} />
          </Avatar>
        )}
        <CardContent sx={sxStyles.cardContent}>
          <Typography variant="headingSmall" ref={hasScrollOverflowObserver.ref} lineHeight="28px">
            {title}
          </Typography>
          {name && (
            <Typography variant="medium" color="primary.main" mb={0.25}>
              {name}
            </Typography>
          )}
          {tokenAddress && (
            <Box sx={sxStyles.transactionInfo}>
              <Typography variant="medium" color="text.secondary">
                {preferredNetwork}
              </Typography>
              {/* TODO: do proper implementation once BE provides chain ID */}
              <CopyableLink link={`https://etherscan.io/nft/${tokenAddress}/${tokenId}`} text={tokenAddress} />
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
}
