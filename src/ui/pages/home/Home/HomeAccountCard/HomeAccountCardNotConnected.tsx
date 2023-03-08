import { Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";

import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

const sxStyles = {
  root: {
    "& .MuiDialog-paper": {
      margin: 0,
      height: "initial",
      maxWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      borderRadius: "10px",
    },
    background: "#00000099",
  },
  content: {
    padding: "0px 32px 25px 31px",
  },
  title: {
    padding: "16px 24px 10px 24px",
  },
  iconButtonClose: {
    top: 12,
    right: 12,
    position: "absolute",
  },
};

export interface HomeAccountCardNotConnectedProps {
  siteName: string;
  open: boolean;
  onClose: () => void;
}

export default function HomeAccountCardNotConnected(props: HomeAccountCardNotConnectedProps) {
  const { siteName, open, onClose } = props;

  return (
    <Dialog open={open} sx={sxStyles.root}>
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
          {siteName}
        </Typography>
        <IconButton aria-label="close dialog" onClick={onClose} sx={sxStyles.iconButtonClose}>
          <CloseIcon color="primary" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={sxStyles.content}>
        <Typography fontSize="16px" lineHeight="24px" textAlign="center" letterSpacing="0.5px" color="text.secondary">
          Aurox is not connected to this site. To connect to a web3 site, find and click the connect button.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
