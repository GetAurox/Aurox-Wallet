import { memo, ChangeEvent } from "react";

import { Typography, ListItem, ListItemButton, ListItemIcon, ListItemAvatar, ListItemText, Stack, Theme } from "@mui/material";

import { TokenDisplay } from "ui/types";

import Checkbox from "ui/components/common/Checkbox";

import { IconPlaceholderNFT } from "ui/components/icons";
import NFTAvatar from "ui/components/entity/nft/NFTAvatar";

const sxStyles = {
  checkbox: {
    p: 0,
    mr: "3px",
  },
  listItemAvatar: {
    minWidth: 36,
    minHeight: 36,
  },
  listItemButton: {
    py: "13px",
    display: "flex",
    columnGap: 1.5,
  },
  listItemText: {
    display: "grid",
    gap: "2px",
    alignSelf: "start",
    overflow: "hidden",
  },
  labelImported: {
    fontSize: "11px",
    lineHeight: "16px",
    padding: "1px 6px",
    textAlgin: "center",
    borderRadius: "5px",
    alignSelf: "center",
    backgroundColor: (theme: Theme) => theme.palette.custom.grey["19"],
  },
};

export interface ManageTokenListItemProps {
  nft: TokenDisplay;
  selected?: boolean;
  onSelect: (token: TokenDisplay) => void;
}

export default memo(function ManageTokenListItem(props: ManageTokenListItemProps) {
  const { nft, onSelect, selected } = props;

  const handleSelect = (event: ChangeEvent) => {
    event.stopPropagation();

    onSelect(nft);
  };

  const name = nft.name ? nft.name : "Error: Unable to get NFT information";

  return (
    <ListItem disablePadding>
      <ListItemButton sx={sxStyles.listItemButton}>
        <ListItemIcon>
          <Checkbox onChange={handleSelect} checked={selected} sx={sxStyles.checkbox} />
        </ListItemIcon>
        <ListItemAvatar sx={sxStyles.listItemAvatar}>
          <NFTAvatar src={nft.img.src} alt={name}>
            <IconPlaceholderNFT />
          </NFTAvatar>
        </ListItemAvatar>

        <ListItemText
          disableTypography
          sx={sxStyles.listItemText}
          primary={
            <Stack direction="row" columnGap={0.5} alignItems="center" overflow="hidden">
              <Typography variant="large" fontWeight={500} overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                {name}
              </Typography>
              {!nft.autoImported && (
                <Typography sx={sxStyles.labelImported} color="text.secondary">
                  Imported
                </Typography>
              )}
            </Stack>
          }
        />
      </ListItemButton>
    </ListItem>
  );
});
