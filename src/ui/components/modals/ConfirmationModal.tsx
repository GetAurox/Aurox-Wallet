import { ReactNode } from "react";

import makeStyles from "@mui/styles/makeStyles";

import { Theme, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";

import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

import { IconClose2 } from "ui/components/icons";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "&.MuiPaper-root": {
      height: "initial",
      maxHeight: "calc(100% - 64px)",
      background: theme.palette.background.paper,
      minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      maxWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      borderRadius: 10,
    },
  },
  actions: {
    "&.MuiDialogActions-root": {
      padding: "0 12px 16px",
    },
  },
  title: {
    "&.MuiTypography-root": {
      padding: "12px 12px 16px",
    },
  },
  titleText: {
    fontWeight: 500,
    fontSize: 20,
    lineHeight: "24px",
    letterSpacing: theme.typography.pxToRem(0.15),
    textAlign: "center",
  },
  close: {
    "&.MuiButtonBase-root": {
      position: "absolute",
      top: 12,
      right: 12,
      minWidth: "unset",
      minHeight: "unset",
      padding: 0,
      borderRadius: 0,
    },
  },
  content: {
    padding: "10px 12px 30px",
  },
}));

export interface ConfirmationModalProps {
  show: boolean;
  title: ReactNode;
  description: ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  fullWidth?: boolean;
  confrimText?: string;
  cancelText?: string;
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
  const { show, title, description, onConfirm, onCancel, fullWidth, confrimText = "Confirm", cancelText = "Cancel" } = props;

  const classes = useStyles();

  const handleConfirm = () => {
    onConfirm && onConfirm();
  };

  const handleCancel = () => {
    onCancel && onCancel();
  };

  return (
    <Dialog disablePortal fullWidth={fullWidth} open={show} classes={{ paper: classes.root }} onClose={handleCancel}>
      <DialogTitle className={classes.title}>
        <Typography component="div" variant="inherit" className={classes.titleText}>
          {title}
        </Typography>
        <IconButton onClick={handleCancel} className={classes.close}>
          <IconClose2 />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.content}>{description}</DialogContent>

      <DialogActions className={classes.actions}>
        <Button variant="outlined" fullWidth autoFocus onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button variant="contained" fullWidth onClick={handleConfirm}>
          {confrimText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
