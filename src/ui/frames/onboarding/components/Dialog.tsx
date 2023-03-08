import {
  DialogContentText as DialogContentTextMui,
  DialogContentTextProps,
  DialogTitle as DialogTitleMui,
  DialogTitleProps,
} from "@mui/material";

export function DialogContentText(props: DialogContentTextProps) {
  return <DialogContentTextMui variant="p400-xl" {...props} />;
}

export function DialogTitle(props: DialogTitleProps) {
  return <DialogTitleMui p={6} variant="h300-xl" {...props} />;
}

export { DialogActions, DialogContent, Dialog as Root } from "@mui/material";
