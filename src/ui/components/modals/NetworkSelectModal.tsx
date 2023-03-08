import { useState } from "react";

import {
  Theme,
  Button,
  Box,
  Dialog,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  ListItemButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
} from "@mui/material";

import { Close as CloseIcon, Done as DoneIcon } from "@mui/icons-material";

import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";
import { BlockchainNetwork } from "common/types";

import { useFuse } from "ui/hooks";
import { BASIC_LIST_ITEM_HEIGHT } from "ui/common/constants";
import { useHistoryPush } from "ui/common/history";

import Search from "ui/components/common/Search";

import { NetworkAvatar } from "../entity/network/NetworkAvatar";

const sxStyles = {
  root: {
    "& .MuiDialog-paper": {
      margin: 0,
      height: "initial",
      minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      borderRadius: "10px",
    },
    background: "#00000099",
  },
  title: {
    padding: "16px 24px 10px 24px",
  },
  content: {
    padding: 0,
  },
  actions: {
    padding: "15px 12px 16px 12px",
  },
  listItemButton: {
    padding: "16px 12px",
  },
  iconButtonClose: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  defaultCheckbox: {
    root: {
      "&.MuiFormControlLabel-root": {
        margin: "18px 0px 9px 12px",
      },
    },
  },
  listItemAvatar: {
    mr: 2,
    minWidth: "fit-content",
  },
  divider: {
    height: 0,
    color: (theme: Theme) => theme.palette.custom.grey["19"],
  },
  search: {
    backgroundColor: (theme: Theme) => theme.palette.custom.grey["30"],
  },
};

export interface NetworkSelectModalProps {
  open: boolean;
  onNetworkSelect: (networkIdentifier: string) => void;
  selectedNetworkIdentifier?: string;
  onClose: () => void;
  variant?: "default" | "additional";
  networks: BlockchainNetwork[];
}

export default function NetworkSelectModal(props: NetworkSelectModalProps) {
  const { open, onNetworkSelect, selectedNetworkIdentifier, onClose, variant = "default", networks } = props;

  const [selectedIdentifier, setSelectedIdentifier] = useState(selectedNetworkIdentifier ?? "");

  const push = useHistoryPush();

  const { fuzzyResults, onSearch } = useFuse<BlockchainNetwork>(networks, {
    keys: ["name"],
    matchAllOnEmptyQuery: true,
  });

  const handleAddNetwork = () => {
    push("/networks");
  };

  const handleNetworkClick = (identifier: string) => {
    setSelectedIdentifier(identifier);
  };

  const handleSelectNetwork = () => {
    onNetworkSelect(selectedIdentifier);

    onClose();
  };

  return (
    <Dialog open={open} sx={sxStyles.root} scroll="paper">
      <DialogTitle sx={sxStyles.title}>
        <Typography
          fontSize="20px"
          fontWeight={500}
          marginTop="21px"
          lineHeight="24px"
          textAlign="center"
          color="text.primary"
          letterSpacing="0.15px"
        >
          Select Network
        </Typography>
        <IconButton aria-label="close-select-network-dialog" onClick={onClose} sx={sxStyles.iconButtonClose}>
          <CloseIcon color="primary" />
        </IconButton>
      </DialogTitle>
      <Box mx={1.5} mb={2.25}>
        <Search sx={sxStyles.search} onChange={onSearch} fullWidth />
      </Box>
      <DialogContent sx={sxStyles.content}>
        <Box height={BASIC_LIST_ITEM_HEIGHT * networks.length}>
          <List disablePadding>
            {fuzzyResults.map(({ item }, index: number) => (
              <Box key={index}>
                <ListItem disablePadding>
                  <ListItemButton sx={sxStyles.listItemButton} onClick={() => handleNetworkClick(item.identifier)}>
                    <ListItemAvatar sx={sxStyles.listItemAvatar}>
                      <NetworkAvatar size={36} network={item} />
                    </ListItemAvatar>
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography variant="large" fontWeight={500}>
                          {item.name}
                        </Typography>
                      }
                    />
                    {selectedIdentifier === item.identifier && (
                      <ListItemIcon>
                        <DoneIcon color="primary" />
                      </ListItemIcon>
                    )}
                  </ListItemButton>
                </ListItem>
                {networks.length !== index + 1 && <Divider component="li" sx={sxStyles.divider} />}
              </Box>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions sx={sxStyles.actions}>
        {variant === "additional" && (
          <Button fullWidth variant="contained" onClick={handleAddNetwork}>
            Add New Network
          </Button>
        )}
        {variant === "default" && (
          <Button fullWidth variant="contained" onClick={handleSelectNetwork}>
            Select
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
