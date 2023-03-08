import { Box, Card, CardContent, Typography } from "@mui/material";

import { ethereumMainnetNetworkIdentifier } from "common/config";

import { formatPrice } from "ui/common/utils";
import { GraphQLMarketsNFTCollection } from "ui/types";
import { useHistoryGoBack } from "ui/common/history";

import CopyableLink from "ui/components/clipboard/CopyableLink";
import Header from "ui/components/layout/misc/Header";
import { IconDiamond } from "ui/components/icons";

import { useNetworkBlockchainExplorerLinkResolver } from "ui/hooks";

const sxStyles = {
  card: {
    padding: "8px 16px 0 16px",
    backgroundColor: "transparent",
    backgroundImage: "none",
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: 0.25,
    padding: 0,
    "&:last-child": {
      paddingBottom: "11px",
    },
  },
  transactionInfo: {
    display: "flex",
    gap: 0.5,
    alignItems: "center",
    marginBottom: "14px",
    marginTop: "-7px",
  },
  priceInfo: {
    display: "flex",
    alignItems: "baseline",
    gap: 0.5,
    marginTop: "-3px",
  },
};

export interface NFTCollectionCardProps {
  collection: GraphQLMarketsNFTCollection;
}

export default function NFTCollectionCard(props: NFTCollectionCardProps) {
  const { collection } = props;

  const goBack = useHistoryGoBack();

  const collectionName = collection.name;

  const preferredNetwork = "ERC20";
  const transactionId = collection.metadata.payout_address;

  const price = formatPrice(collection.metadata.stats.floor_price);
  const priceUSD = formatPrice(collection.metadata.stats.floor_price);
  const priceChangeValue = formatPrice(collection.metadata.stats.one_day_change, { mantissa: 2 });

  const { getTransactionExplorerLink } = useNetworkBlockchainExplorerLinkResolver(ethereumMainnetNetworkIdentifier);

  const link = getTransactionExplorerLink(transactionId);

  return (
    <>
      <Header title={collectionName} onBackClick={goBack} />
      <Card sx={sxStyles.card}>
        <CardContent sx={sxStyles.cardContent}>
          <Typography fontSize="20px" fontWeight={500} lineHeight="28px" letterSpacing="0.15px">
            {collectionName}
          </Typography>
          <Box sx={sxStyles.transactionInfo}>
            <Typography fontSize="14px" lineHeight="20px" letterSpacing="0.25px" color="text.secondary">
              {preferredNetwork}
            </Typography>
            <CopyableLink link={link} text={transactionId} />
          </Box>
          <Box sx={sxStyles.priceInfo}>
            <IconDiamond width="16" height="18" />
            <Typography fontSize="20px" fontWeight={600} lineHeight="20px" letterSpacing="0.15px">
              {price}
            </Typography>
            <Typography fontSize="14px" fontWeight={500} lineHeight="24px" letterSpacing="0.1px" color="text.secondary">
              ({priceUSD})
            </Typography>
            <Typography
              fontSize="14px"
              fontWeight={500}
              lineHeight="24px"
              letterSpacing="0.1px"
              color={parseInt(priceChangeValue) > 0 ? "success.main" : "error.main"}
            >
              {priceChangeValue}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
