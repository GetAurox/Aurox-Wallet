import { useState, MouseEvent, useEffect } from "react";

import { IconButton, Popover, PopoverOrigin, SnackbarOrigin, SxProps, Theme, Typography } from "@mui/material";

import { ContentCopy as ContentCopyIcon } from "@mui/icons-material";
import { mixSx } from "ui/common/utils";

type Status = "done" | "failed" | null;
type ButtonColor = "primary" | "success" | "error";

const anchorOrigin: SnackbarOrigin = {
  vertical: "bottom",
  horizontal: "right",
};

const transformOrigin: PopoverOrigin = {
  vertical: "top",
  horizontal: "left",
};

function getButtonColor(status: Status): ButtonColor {
  let retVal: ButtonColor = "primary";

  if (status === "done") {
    retVal = "success";
  }

  if (status === "failed") {
    retVal = "error";
  }

  return retVal;
}

function getClipboardText(status: Status) {
  let retVal = "Copied to clipboard";

  if (status === "failed") {
    retVal = "Copied to clipboard failed";
  }

  return retVal;
}

const sxStyles = {
  iconButton: {
    p: 0,
  },
  icon: {
    width: 20,
    height: 20,
  },
  clipboard: {
    backgroundColor: (theme: Theme) => theme.palette.custom.grey["17"],
  },
};

export interface CopyToClipboardProps {
  text: string;
  sx?: Partial<Record<keyof typeof sxStyles, SxProps<Theme>>>;
}

export default function CopyToClipboard(props: CopyToClipboardProps) {
  const { text, sx = {} } = props;

  const [anchorEl, setAnchorEl] = useState<EventTarget | null>(null);

  const [status, setStatus] = useState<Status>(null);

  const handleCopyToClipboard = (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();

    navigator.clipboard.writeText(text).then(
      () => {
        setStatus("done");
        setAnchorEl(event.target);
      },
      () => {
        setStatus("failed");
        setAnchorEl(event.target);
      },
    );
  };

  useEffect(() => {
    if (anchorEl && status) {
      const timeout = window.setTimeout(() => {
        setAnchorEl(null);
        setStatus(null);
      }, 1000);

      return () => {
        window.clearTimeout(timeout);
      };
    }
  }, [anchorEl, status]);

  const open = Boolean(anchorEl);
  const id = open ? "clipboard-popover" : undefined;

  const buttonColor = getButtonColor(status);
  const clipboardText = getClipboardText(status);

  return (
    <>
      <IconButton sx={mixSx(sxStyles.iconButton, sx.iconButton)} aria-describedby={id} onClick={handleCopyToClipboard} color="primary">
        <ContentCopyIcon sx={mixSx(sxStyles.icon, sx.icon)} color={buttonColor} />
      </IconButton>
      <Popover id={id} open={open} anchorOrigin={anchorOrigin} anchorEl={anchorEl as Element} transformOrigin={transformOrigin}>
        <Typography variant="small" sx={mixSx(sxStyles.clipboard, sx.clipboard)} p={0.75}>
          {clipboardText}
        </Typography>
      </Popover>
    </>
  );
}
