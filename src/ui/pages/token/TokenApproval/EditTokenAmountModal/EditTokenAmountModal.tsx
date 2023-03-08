import { useState } from "react";

import makeStyles from "@mui/styles/makeStyles";

import { Theme, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";

import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

import { IconClose2 } from "ui/components/icons";

import EditTokenAmountInput from "./EditTokenAmountInput";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "&.MuiPaper-root": {
      height: "initial",
      maxHeight: "calc(100% - 64px)",
      background: theme.palette.background.paper,
      minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      maxWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
      borderRadius: 10,
      transform: "translate(0, -15%)",
    },
  },
  actions: {
    "&.MuiDialogActions-root": {
      padding: "0 12px 16px",
      marginTop: "30px",
    },
  },
  title: {
    "&.MuiTypography-root": {
      padding: "12px 12px 16px",
    },
  },
  content: {
    "&.MuiDialogContent-root": {
      padding: 0,
    },
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
  form: {
    marginTop: "16px",
    paddingLeft: "12px",
    paddingRight: "12px",
  },
  titleText: {
    textAlign: "center",
    paddingTop: "10px",
    "&.MuiTypography-root": {
      fontWeight: 500,
      fontSize: "20px",
      lineHeight: "24px",
      letterSpacing: theme.typography.pxToRem(0.15),
    },
  },
}));

export interface EditTokenAmountModalProps {
  show: boolean;
  amount: number;
  balance: number;
  symbol: string;
  decimals: number;
  price?: number;
  fullWidth?: boolean;
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

export default function EditTokenAmountModal(props: EditTokenAmountModalProps) {
  const classes = useStyles();
  const { show, onConfirm, onCancel, fullWidth, symbol, amount, balance, price, decimals } = props;

  const [inputAmount, setInputAmount] = useState(0);

  const handleConfirm = () => {
    onConfirm(inputAmount);
  };

  return (
    <Dialog disablePortal fullWidth={fullWidth} open={show} classes={{ paper: classes.root }} onClose={onCancel}>
      <DialogTitle className={classes.title}>
        <IconButton onClick={onCancel} className={classes.close}>
          <IconClose2 />
        </IconButton>
      </DialogTitle>

      <DialogContent className={classes.content}>
        <Typography className={classes.titleText}>Edit Amount</Typography>
        <Box className={classes.form}>
          <EditTokenAmountInput
            symbol={symbol}
            price={price}
            amount={amount}
            balance={balance}
            setBalance={setInputAmount}
            decimals={decimals}
          />
        </Box>
      </DialogContent>

      <DialogActions className={classes.actions}>
        <Button variant="contained" fullWidth onClick={handleConfirm}>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
