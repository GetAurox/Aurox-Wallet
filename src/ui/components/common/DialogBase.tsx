import { ReactNode } from "react";

import {
  styled,
  Dialog,
  dialogClasses,
  DialogTitle,
  DialogTitleProps,
  dialogTitleClasses,
  DialogContent,
  dialogContentClasses,
  DialogActions,
  dialogActionsClasses,
  IconButton,
  iconButtonClasses,
  SxProps,
} from "@mui/material";

import { BASE_DIALOG_HEIGHT_OFFSET, DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS } from "common/manifest";

import { IconClose } from "ui/components/icons";

const BaseDialog = styled(Dialog)(({ theme }) => ({
  [`& .${dialogClasses.paper}`]: {
    margin: 16,
    height: "auto",
    borderRadius: 10,
    background: theme.palette.background.paper,
    minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
    maxWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
    maxHeight: `calc(100% - ${BASE_DIALOG_HEIGHT_OFFSET}px)`,
  },
}));

const BaseDialogTitle = styled((props: DialogTitleProps) => <DialogTitle {...props} />)({
  [`&.${dialogTitleClasses.root}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "12px 12px 8px",
  },
});

const BaseDialogContent = styled(DialogContent)({
  [`&.${dialogContentClasses.root}`]: {
    padding: "4px 12px 12px",
  },
});

const BaseDialogActions = styled(DialogActions)({
  [`&.${dialogActionsClasses.root}`]: {
    padding: "16px 12px",
  },
});

const CloseButton = styled(IconButton)({
  [`&.${iconButtonClasses.root}`]: {
    alignSelf: "flex-end",
    padding: 0,
  },
});

export interface DialogBaseProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  content?: ReactNode;
  actions?: ReactNode;
  disablePortal?: boolean;
  sxContent?: SxProps;
}

export default function DialogBase(props: DialogBaseProps) {
  const { open, onClose, title, content, actions, disablePortal = true, sxContent } = props;

  return (
    <BaseDialog open={open} onClose={onClose} disablePortal={disablePortal}>
      {title && (
        <BaseDialogTitle component="section" typography="inherit">
          <CloseButton sx={{ mb: 0.5 }} disableRipple color="primary" onClick={onClose}>
            <IconClose />
          </CloseButton>
          {title}
        </BaseDialogTitle>
      )}
      {content && <BaseDialogContent sx={sxContent}>{content}</BaseDialogContent>}
      {actions && <BaseDialogActions>{actions}</BaseDialogActions>}
    </BaseDialog>
  );
}
