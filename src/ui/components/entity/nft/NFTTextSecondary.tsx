import { Button, Box, Typography } from "@mui/material";

import { NFTItem, NFTStatus } from "common/types";

import NFTItemTextRow from "./NFTItemTextRow";

const sxStyles = {
  status: {
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0.25px",
    textTransform: "capitalize",
  },
  artist: {
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0.25px",
  },
  volume: {
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0.25px",
  },
};

export const statusColorNFT: Record<NFTStatus, string> = {
  pending: "#F6C009",
  bought: "#54C06E",
  sold: "#54C06E",
};

export interface NFTTextSecondaryProps {
  item: NFTItem;
  transaction: boolean;
}

export default function NFTTextSecondary(props: NFTTextSecondaryProps) {
  const { item, transaction } = props;

  const { status, artistName, tokenContractType } = item;

  if (transaction) {
    return (
      <>
        <NFTItemTextRow>
          <Typography sx={sxStyles.artist} color="text.secondary">
            From{" "}
            <Box component="span" color="primary.main">
              {artistName}
            </Box>
          </Typography>
        </NFTItemTextRow>
        <NFTItemTextRow>
          <Typography sx={sxStyles.status} color={statusColorNFT[status]}>
            {status}
          </Typography>
          {status === "pending" && (
            <Button variant="contained" size="small">
              Cancel Listing
            </Button>
          )}
        </NFTItemTextRow>
      </>
    );
  }

  return (
    <>
      <NFTItemTextRow>
        <Typography sx={sxStyles.artist} color="text.secondary">
          {tokenContractType}{" "}
        </Typography>
      </NFTItemTextRow>
    </>
  );
}
