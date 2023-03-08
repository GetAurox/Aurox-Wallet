import { Button, Box, Dialog, IconButton, Typography } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";

import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

const sxStyles = {
  root: {
    "& .MuiDialog-paper": {
      height: "initial",
      minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      margin: 0,
      padding: "12px",
      borderRadius: "10px",
      backgroundBlendMode: "Pass through",
    },
    background: "#00000099",
  },
  iconWrapper: {
    display: "flex",
    justifyContent: "end",
  },
  icon: {
    padding: 0,
    color: "primary.main",
  },
  button: {
    fontSize: "16px",
    lineHeight: "24px",
    letterSpacing: "0.15px",
    margin: "0",
    minWidth: "158px",
  },
  buttonWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    bgcolor: "background.paper",
    padding: "16px",
    gap: 1.5,
  },
};

export interface SelectionCancelModalProps {
  open: boolean;
  onClose: () => void;
  onCancel: () => void;
}

export default function SelectionCancelModal(props: SelectionCancelModalProps) {
  const { open, onClose, onCancel } = props;

  return (
    <Dialog disablePortal open={open} sx={sxStyles.root}>
      <Box sx={sxStyles.iconWrapper}>
        <IconButton aria-label="Close dialog" onClick={onClose} sx={sxStyles.icon}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography
        fontWeight={500}
        fontSize="20px"
        lineHeight="24px"
        letterSpacing="0.15px"
        color="text.primary"
        textAlign="center"
        marginTop="1px"
        marginBottom="18px"
      >
        Do you want to cancel this selection?
      </Typography>
      <Box sx={sxStyles.buttonWrapper}>
        <Button variant="contained" sx={sxStyles.button} onClick={onCancel}>
          Yes, cancel
        </Button>
        <Button variant="outlined" sx={sxStyles.button} onClick={onClose}>
          No, go back
        </Button>
      </Box>
    </Dialog>
  );
}
