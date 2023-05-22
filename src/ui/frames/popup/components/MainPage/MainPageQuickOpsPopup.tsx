import { memo } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";

import { makeStyles, useTheme } from "@mui/styles";
import { Typography, Theme, Stack } from "@mui/material";

import useAnalytics from "ui/common/analytics";
import { useActiveAccount, useActiveAccountNetworkAddress } from "ui/hooks";

import LegacyModal from "ui/components/common/LegacyModal";
import { IconClose2, IconReceive, IconSend, IconSwap } from "ui/components/icons";

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
    pointerEvents: "none",
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

  const { trackButtonClicked } = useAnalytics();

  const activeAccountNetworkAddress = useActiveAccountNetworkAddress();
  const activeAccount = useActiveAccount();

  const isHardwareWallet = activeAccount?.type === "hardware";

  const handleSend = () => {
    trackButtonClicked("Main Send");

    onClose();
  };

  const handleSwap = () => {
    trackButtonClicked("Main Swap");

    onClose();
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

        <Link to="/send-select" className={classes.item} onClick={handleSend}>
          <IconSend className={classes.icon} />
          <Stack ml={2}>
            <Typography className={classes.primary}>Send</Typography>
            <Typography variant="medium" mt={0.5} color={theme.palette.text.secondary}>
              Transfer your tokens to another wallet
            </Typography>
          </Stack>
        </Link>

        <Link to={`/receive/${activeAccountNetworkAddress}`} onClick={onClose} className={classes.item}>
          <IconReceive className={classes.icon} />
          <Stack ml={2}>
            <Typography className={classes.primary}>Receive</Typography>
            <Typography variant="medium" mt={0.5} color={theme.palette.text.secondary}>
              Show your public wallet address
            </Typography>
          </Stack>
        </Link>

        <Link to="/swap" onClick={handleSwap} className={clsx(classes.item, isHardwareWallet && classes.itemDisabled)}>
          <IconSwap color={isHardwareWallet ? undefined : theme.palette.primary.main} className={classes.icon} />
          <Stack ml={2}>
            <Typography className={classes.primary}>Swap</Typography>
            <Typography variant="medium" mt={0.5} color={theme.palette.text.secondary}>
              {isHardwareWallet ? "Swapping with Hardware Wallets will be supported soon." : "Trade your tokens"}
            </Typography>
          </Stack>
        </Link>
      </div>
    </LegacyModal>
  );
});
