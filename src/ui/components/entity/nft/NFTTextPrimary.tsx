import { Typography } from "@mui/material";

import { NFTItem } from "common/types";

import NFTItemTextRow from "./NFTItemTextRow";

const sxStyles = {
  username: {
    fontWeight: 500,
    fontSize: "1rem",
    lineHeight: "20px",
    letterSpacing: "0.15px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

export interface NFTTextPrimaryProps {
  item: NFTItem;
}

export default function NFTTextPrimary(props: NFTTextPrimaryProps) {
  const { name } = props.item;

  return (
    <NFTItemTextRow>
      <Typography sx={sxStyles.username} color="text.primary">
        {name}
      </Typography>
    </NFTItemTextRow>
  );
}
