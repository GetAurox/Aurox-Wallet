import { Divider, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";

import Checkbox from "ui/components/common/Checkbox";

import { BlockchainNetwork } from "common/types";

import { NetworkAvatar } from "./NetworkAvatar";

const sxStyles = {
  checkbox: {
    p: 0,
  },
  listItemButton: {
    "&.MuiListItemButton-root": {
      px: 2,
      py: 2,
      columnGap: 1.5,
    },
  },
  listItemAvatar: {
    minWidth: "fit-content",
  },
};

export interface NetworksSelectionItemProps {
  divider: boolean;
  selected: boolean;
  network: BlockchainNetwork;
  onClick: (networkIdentifier: string) => void;
}

export default function NetworksSelectionItem(props: NetworksSelectionItemProps) {
  const { network, onClick, selected, divider } = props;

  const handleItemClick = () => {
    onClick(network.identifier);
  };

  return (
    <>
      <ListItem disablePadding alignItems="flex-start">
        <ListItemButton onClick={handleItemClick} sx={sxStyles.listItemButton}>
          <ListItemIcon>
            <Checkbox sx={sxStyles.checkbox} checked={selected} />
          </ListItemIcon>
          <ListItemAvatar sx={sxStyles.listItemAvatar}>
            <NetworkAvatar network={network} />
          </ListItemAvatar>
          <ListItemText disableTypography primary={<Typography variant="large">{network.name}</Typography>} />
        </ListItemButton>
      </ListItem>
      {divider && <Divider variant="middle" component="li" />}
    </>
  );
}
