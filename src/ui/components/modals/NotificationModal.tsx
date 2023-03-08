import { ReactNode } from "react";

import makeStyles from "@mui/styles/makeStyles";

import { Theme, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "&.MuiPaper-root": {
      height: "initial",
      maxHeight: "calc(100% - 64px)",
      background: theme.palette.background.paper,
      minWidth: 328,
      maxWidth: 328,
      borderRadius: 10,
    },
  },
  actions: {
    "&.MuiDialogActions-root": {
      padding: "0 12px 16px",
    },
  },
  image: {
    margin: "auto",
  },
  title: {
    "&.MuiTypography-root": {
      padding: "12px 12px 16px",
    },
  },
  titleText: {
    fontWeight: 500,
    fontSize: 24,
    lineHeight: "32px",
    letterSpacing: theme.typography.pxToRem(0.18),
    textAlign: "center",
  },
  description: {
    color: theme.palette.text.secondary,
    fontWeight: 400,
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "center",
  },
}));

export interface NotificationModalProps {
  show: boolean;
  image?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  onClick?: () => void;
  fullWidth?: boolean;
}

export default function NotificationModal(props: NotificationModalProps) {
  const { show, image, title, description, onClick, fullWidth } = props;

  const classes = useStyles();

  return (
    <Dialog disablePortal fullWidth={fullWidth} open={show} classes={{ paper: classes.root }} onClose={onClick}>
      <DialogContent className={classes.image}>{image}</DialogContent>
      <DialogTitle className={classes.title}>
        <Typography component="div" variant="inherit" className={classes.titleText}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent className={classes.description}>{description}</DialogContent>

      <DialogActions className={classes.actions}>
        <Button variant="contained" fullWidth onClick={onClick}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
