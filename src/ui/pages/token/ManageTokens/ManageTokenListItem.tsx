import { memo, ChangeEvent } from "react";

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
  token: TokenDisplay;
  selected?: boolean;
  onSelect: (token: TokenDisplay) => void;
}

export default memo(function ManageTokenListItem(props: ManageTokenListItemProps) {
  const { token, onSelect, selected } = props;

  const { getContractAddressExplorerLink } = useNetworkBlockchainExplorerLinkResolver(token.networkIdentifier);

  const handleSelect = (event: ChangeEvent) => {
    event.stopPropagation();

    onSelect(token);
  };

  const handleAddressClick = () => {
    if (token.assetDefinition.type === "contract") {
      const link = getContractAddressExplorerLink(token.assetDefinition.contractAddress);

      if (link) window.open(link, "_blank");
    }
  };

  return (
    <ListItem disablePadding>
      <ListItemButton sx={sxStyles.listItemButton}>
        <ListItemIcon>
          <Checkbox onChange={handleSelect} checked={selected} sx={sxStyles.checkbox} />
        </ListItemIcon>
        <ListItemAvatar sx={sxStyles.listItemAvatar}>
          <TokenAvatar {...token.img} networkIdentifier={token.networkIdentifier} />
        </ListItemAvatar>

        <ListItemText
          disableTypography
          sx={sxStyles.listItemText}
          primary={
            <Stack direction="row" columnGap={0.5} alignItems="center" overflow="hidden">
              <Typography variant="large" fontWeight={500} overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
                {token.symbol}
              </Typography>
              {!token.autoImported && (
                <Typography sx={sxStyles.labelImported} color="text.secondary">
                  Imported
                </Typography>
              )}
            </Stack>
          }
          secondary={
            token.assetDefinition.type !== "contract" ? undefined : (
              <Typography variant="medium" color="primary.main" onClick={handleAddressClick} sx={sxStyles.address}>
                {collapseIdentifier(token.assetDefinition.contractAddress)}
              </Typography>
            )
          }
        />
        <ListItemText
          sx={sxStyles.listItemText}
          disableTypography
          primary={
            <Typography fontSize="16px" textAlign="right" fontWeight={500} lineHeight="20px" letterSpacing={0.5}>
              {token.balance}
            </Typography>
          }
        />
      </ListItemButton>
    </ListItem>
  );
});
