import { ListItem, ListItemButton, ListItemText } from "@mui/material";

import { NFTItem } from "common/types";

import { IconPlaceholderNFT } from "ui/components/icons";

import { useHistoryPush } from "ui/common/history";

import NFTTextSecondary from "./NFTTextSecondary";
import NFTTextPrimary from "./NFTTextPrimary";
import NFTAvatar from "./NFTAvatar";

const sxStyles = {
  listItemButton: {
    py: 2.5,
  },
  itemText: {
    my: 0,
    gap: 0.5,
    display: "flex",
    flexDirection: "column",
  },
};

export const NFT_ITEM_HEIGHT = 112;

export interface NFTListItemProps {
  item: NFTItem;
  transaction?: boolean;
}

export default function NFTListItem(props: NFTListItemProps) {
  const { item, transaction = false } = props;

  const push = useHistoryPush();

  const { name, icon, tokenAddress, tokenId, networkIdentifier } = item;

  const handleItemClick = () => {
    push(`/nft/${networkIdentifier}/${tokenAddress}/${tokenId}`);
  };

  return (
    <ListItem disablePadding>
      <ListItemButton sx={sxStyles.listItemButton} onClick={handleItemClick}>
        <NFTAvatar src={icon} alt={name} networkIdentifier={networkIdentifier}>
          <IconPlaceholderNFT />
        </NFTAvatar>
        <ListItemText
          disableTypography
          sx={sxStyles.itemText}
          primary={<NFTTextPrimary item={item} />}
          secondary={<NFTTextSecondary item={item} transaction={transaction} />}
        />
      </ListItemButton>
    </ListItem>
  );
}
