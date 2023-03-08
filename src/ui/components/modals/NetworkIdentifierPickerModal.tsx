import {
  Theme,
  Box,
  Dialog,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  DialogTitle,
  DialogContent,
  ListItemIcon,
  Typography,
} from "@mui/material";

import { Close as CloseIcon, Done as DoneIcon } from "@mui/icons-material";

import { useEnabledNetworks, useFuse } from "ui/hooks";
import { BASIC_LIST_ITEM_HEIGHT } from "ui/common/constants";

import { BlockchainNetwork } from "common/types";

import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

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
    padding: "16px 24px 13px 24px",
  },
  content: {
    padding: "6px 12px 18px 12px",
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
    "&.MuiFormControlLabel-root": {
      margin: "18px 0px 9px 12px",
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

export interface NetworkIdentifierPickerModalProps {
  open: boolean;
  onClose: () => void;
  current: string | null;
  onSelect: (identifier: string) => void;
}

export default function NetworkIdentifierPickerModal(props: NetworkIdentifierPickerModalProps) {
  const { open, onClose, current, onSelect } = props;

  const networks = useEnabledNetworks() ?? [];

  const { fuzzyResults, onSearch } = useFuse<BlockchainNetwork>(networks, {
    keys: ["name"],
    matchAllOnEmptyQuery: true,
  });

  const handleNetworkClick = (identifier: string) => {
    onSelect(identifier);
  };

  return (
    <Dialog open={open} sx={sxStyles.root}>
      <DialogTitle sx={sxStyles.title}>
        <Typography variant="headingSmall" marginTop="21px" textAlign="center" color="text.primary">
          Select Network
        </Typography>
        <IconButton onClick={onClose} sx={sxStyles.iconButtonClose}>
          <CloseIcon color="primary" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={sxStyles.content}>
        <Search sx={sxStyles.search} onChange={onSearch} fullWidth />
      </DialogContent>
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
                      <Typography variant="large" fontWeight={500} color="text.primary">
                        {item.name}
                      </Typography>
                    }
                  />
                  {current === item.identifier && (
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
    </Dialog>
  );
}
