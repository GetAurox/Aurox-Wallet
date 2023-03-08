import { memo, MouseEvent } from "react";
import clsx from "clsx";

import { makeStyles, useTheme } from "@mui/styles";

import { Typography, Theme, Stack } from "@mui/material";

import { useHistoryPush } from "ui/common/history";
import { useActiveAccountNetworkAddress } from "ui/hooks";

import { IconClose2, IconReceive, IconSend, IconSwap } from "ui/components/icons";
import LegacyModal from "ui/components/common/LegacyModal";

const useStyles = makeStyles((theme: Theme) => ({
  wrap: {
    position: "relative",
    width: "100%",
    paddingTop: 40,
    paddingBottom: 16,
  },
  item: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: 16,
    color: theme.palette.text.primary,
    textDecoration: "none",
  },
  itemDisabled: {
    color: theme.palette.text.secondary,
    cursor: "default",
  },
  close: {
    position: "absolute",
    top: 18,
    right: 18,
    textDecoration: "none",
  },
  closeIcon: {
    width: 24,
  },
  primary: {
    fontSize: 17,
    lineHeight: 20 / 17,
  },
  icon: {
    minWidth: 36,
  },
}));

export interface MainPageQuickOpsPopupProps {
  open: boolean;
  onClose: () => void;
}

export default memo(function MainPageQuickOpsPopup(props: MainPageQuickOpsPopupProps) {
  const { open, onClose } = props;

  const classes = useStyles();
  const theme = useTheme<Theme>();

  const push = useHistoryPush();

  const activeAccountNetworkAddress = useActiveAccountNetworkAddress();

  const createHandleItemClick = (path: string) => (event: MouseEvent) => {
    event.preventDefault();

    onClose();

    push(path);
  };

  return (
    <LegacyModal open={open}>
      <div className={classes.wrap}>
        <a onClick={onClose} className={classes.close}>
          <IconClose2 className={classes.closeIcon} />
        </a>

        <Typography component="h1" variant="headingSmall" mb={2} textAlign="center">
          Select an Action
        </Typography>

        <a href="#" onClick={createHandleItemClick("/send-select")} className={classes.item}>
          <IconSend className={classes.icon} />
          <Stack ml={2}>
            <Typography className={classes.primary}>Send</Typography>
            <Typography variant="medium" mt={0.5} color={theme.palette.text.secondary}>
              Transfer your tokens to another wallet
            </Typography>
          </Stack>
        </a>

        <a href="#" onClick={createHandleItemClick(`/receive/${activeAccountNetworkAddress}`)} className={classes.item}>
          <IconReceive className={classes.icon} />
          <Stack ml={2}>
            <Typography className={classes.primary}>Receive</Typography>
            <Typography variant="medium" mt={0.5} color={theme.palette.text.secondary}>
              Show your public wallet address
            </Typography>
          </Stack>
        </a>

        <span className={clsx(classes.item, classes.itemDisabled)}>
          <IconSwap className={classes.icon} />
          <Stack ml={2}>
            <Typography className={classes.primary}>Swap</Typography>
            <Typography variant="medium" mt={0.5} color={theme.palette.text.secondary}>
              Gasless swapping is being finished & will be available soon.
            </Typography>
          </Stack>
        </span>
      </div>
    </LegacyModal>
  );
});
