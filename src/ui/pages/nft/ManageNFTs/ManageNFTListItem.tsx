import { memo, ChangeEvent } from "react";
import { Link } from "react-router-dom";

import { Typography, ListItem, ListItemButton, ListItemIcon, ListItemAvatar, ListItemText, Stack, Theme } from "@mui/material";

import { useNetworkBlockchainExplorerLinkResolver } from "ui/hooks";
import { collapseIdentifier } from "ui/common/utils";
import { TokenDisplay } from "ui/types";

import TokenAvatar from "ui/components/common/TokenAvatar";
import Checkbox from "ui/components/common/Checkbox";

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
  address: { cursor: "pointer" },
};

export interface ManageTokenListItemProps {
  nft: TokenDisplay;
  selected?: boolean;
  onSelect: (token: TokenDisplay) => void;
}

export default memo(function ManageTokenListItem(props: ManageTokenListItemProps) {
  const { nft, onSelect, selected } = props;

  const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(nft.networkIdentifier);

  let link: string | null = null;

  if (nft.assetDefinition.type === "contract") {
    link = getContractAddressExplorerLink(nft.assetDefinition.contractAddress);
  }

  const handleSelect = (event: ChangeEvent) => {
    event.stopPropagation();

    onSelect(nft);
  };

  return (
    <ListItem disablePadding>
      <ListItemButton sx={sxStyles.listItemButton}>
        <ListItemIcon>
          <Checkbox onChange={handleSelect} checked={selected} sx={sxStyles.checkbox} />
        </ListItemIcon>
        <ListItemAvatar sx={sxStyles.listItemAvatar}>
          <TokenAvatar {...nft.img} networkIdentifier={nft.networkIdentifier} />
        </ListItemAvatar>

        <ListItemText
          disableTypography
          sx={sxStyles.listItemText}
          primary={
            <Stack direction="row" columnGap={0.5} alignItems="center" overflow="hidden">
              <Typography variant="large" fontWeight={500} overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                {nft.symbol}
              </Typography>
              {!nft.autoImported && (
                <Typography sx={sxStyles.labelImported} color="text.secondary">
                  Imported
                </Typography>
              )}
            </Stack>
          }
          secondary={
            nft.assetDefinition.type !== "contract" ? undefined : (
              <Link color="primary.main" to={link ?? ""} target="_blank" rel="noopener noreferrer">
                {collapseIdentifier(nft.assetDefinition.contractAddress)}
              </Link>
            )
          }
        />
        <ListItemText
          sx={sxStyles.listItemText}
          disableTypography
          primary={
            <Typography fontSize="16px" textAlign="right" fontWeight={500} lineHeight="20px" letterSpacing={0.5}>
              1
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
});
