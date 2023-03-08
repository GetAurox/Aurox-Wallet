import { ReactNode } from "react";
import { Box, IconButton, Typography, SxProps, Theme } from "@mui/material";
import { Close as CloseIcon, ArrowBackIos as ArrowBackIosIcon } from "@mui/icons-material";

import { mixSx } from "ui/common/utils";

const styles = {
  wrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    px: 5,
    py: 2,
  },
  button: {
    position: "absolute",
    top: 16,
    padding: 0,
    borderRadius: 0,
  },
  backButton: {
    left: 16,
  },
  closeButton: {
    right: 16,
  },
  backButtonIcon: {
    width: 22,
    height: 22,
    fontSize: 22,
  },
  closeButtonIcon: {
    width: 24,
    height: 24,
    fontSize: 24,
  },
  title: {
    flexGrow: 1,
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "24px",
    textAlign: "center",
    color: "text.primary",
    letterSpacing: "0.1px",
  },
};

export interface HeaderProps {
  title: string;
  onBackClick?: () => void;
  onCloseClick?: () => void;
  sx?: Partial<Record<keyof typeof styles, SxProps<Theme>>>;
  children?: ReactNode;
  closeIcon?: ReactNode;
}

export default function Header(props: HeaderProps) {
  const { title, onBackClick, onCloseClick, sx, children, closeIcon } = props;

  return (
    <Box component="section" sx={mixSx(styles.wrap, sx?.wrap)}>
      {onBackClick && (
        <IconButton
          color="primary"
          sx={mixSx(styles.button, sx?.button, styles.backButton, sx?.backButton)}
          disableRipple
          onClick={onBackClick}
        >
          <ArrowBackIosIcon sx={mixSx(styles.backButtonIcon, sx?.backButtonIcon)} />
        </IconButton>
      )}
      <Typography sx={mixSx(styles.title, sx?.title)}>{title}</Typography>
      {children}
      {onCloseClick && (
        <IconButton
          color="primary"
          sx={mixSx(styles.button, sx?.button, styles.closeButton, sx?.closeButton)}
          disableRipple
          onClick={onCloseClick}
        >
          {closeIcon ? closeIcon : <CloseIcon sx={mixSx(styles.closeButtonIcon, sx?.closeButtonIcon)} />}
        </IconButton>
      )}
    </Box>
  );
}
