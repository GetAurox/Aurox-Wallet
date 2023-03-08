import { useEffect, useState } from "react";
import produce from "immer";

import { Theme, Button, IconButton, Stack, useTheme, Tooltip, tooltipClasses, Typography } from "@mui/material";

import CheckboxField from "ui/components/form/CheckboxField";
import NetworkSelectModal from "ui/components/modals/NetworkSelectModal";
import { IconWalletConnected, IconWalletDisconnected, IconArrowDownIOS } from "ui/components/icons";

import { useCurrentTabDappConnectionInfo, useEnabledNetworks, useLocalUserPreferences, useNetworkGetter } from "ui/hooks";

import { DApp as DAppOps } from "common/operations";
import { DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS, POPUP_WIDTH_OFFSETS } from "common/manifest";

import HomeAccountCardNotConnected from "./HomeAccountCardNotConnected";

const sxStyles = {
  buttonConnected: {
    padding: "6px 12px",
    borderRadius: 2,
    backgroundColor: "#1A3228",
    "&.MuiButton-sizeMedium": {
      padding: "2px 6px",
      borderRadius: "6px",
    },
    "&:hover": {
      backgroundColor: "#1A3228",
    },
  },
  buttonConnect: {
    borderRadius: 2,
    backgroundColor: (theme: Theme) => theme.palette.custom.grey["25"],
    "&:hover": {
      backgroundColor: (theme: Theme) => theme.palette.custom.grey["25"],
    },
    "&.MuiButton-sizeMedium": {
      padding: "6px 12px",
    },
  },
  buttonPopoverOk: {
    width: 56,
    height: 24,
    "&.MuiButton-sizeSmall": {
      p: "4px 8px",
      fontSize: 12,
      borderRadius: "7px",
      lineHeight: 16 / 12,
    },
  },
  iconButton: {
    padding: 0,
  },
  iconButtonInfo: {
    padding: 0,
    marginRight: "6px",
  },
  plugTooltip: {
    [`& .${tooltipClasses.tooltip}`]: {
      left: POPUP_WIDTH_OFFSETS / 2,
      minWidth: DEFAULT_POPUP_WIDTH_WITHOUT_OFFSETS,
    },
    [`& .${tooltipClasses.arrow}`]: {
      fontSize: 16,
      left: `-${POPUP_WIDTH_OFFSETS / 2}px !important`,
    },
  },
};

export interface HomeAccountCardConnectionProps {
  accountUUID: string;
}

export default function HomeAccountCardConnection(props: HomeAccountCardConnectionProps) {
  const theme = useTheme();
  const { accountUUID } = props;

  const [isNetworkDialogOpen, setIsNetworkDialogOpen] = useState(false);
  const [isNoNetworkDialogOpen, setIsNoNetworkDialogOpen] = useState(false);
  const [doNotShowPlugPopover, setDoNotShowPlugPopover] = useState(false);

  const { connection, domain } = useCurrentTabDappConnectionInfo();
  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const [networkIdentifier, setNetworkIdentifier] = useState(connection?.networkIdentifier);

  const networks = useEnabledNetworks() ?? [];

  const networkGetter = useNetworkGetter();

  const network = networkGetter(networkIdentifier);
  const isAccountConnected = connection && connection.accountUUID === accountUUID;

  const handleOpenNetworkDialog = () => {
    setIsNetworkDialogOpen(true);
  };

  const handleNetworkSelect = async (networkIdentifier: string) => {
    setNetworkIdentifier(networkIdentifier);

    if (connection) {
      const { domain, tabId } = connection;

      await DAppOps.SwitchNetwork.perform({ domain, tabId, targetNetworkIdentifier: networkIdentifier });
    }
  };

  const toggleConnection = () => {
    if (!connection) return;

    const { domain, tabId } = connection;

    if (isAccountConnected) {
      DAppOps.Disconnect.perform({ domain, tabId });
    } else {
      DAppOps.SwitchAccount.perform({ domain, tabId, accountUUID });
    }
  };

  const handlePlugPopoverOk = () => {
    setUserPreferences(
      produce(draft => {
        draft.connectionPlugPopover = { open: false, isInitial: false, show: !doNotShowPlugPopover };
      }),
    );
  };

  const handleDoNotShowPlugPopover = () => {
    setDoNotShowPlugPopover(prevState => !prevState);
  };

  useEffect(() => {
    if (connection) {
      setNetworkIdentifier(connection.networkIdentifier);
    }
  }, [connection]);

  const handleDialogClose = () => {
    setIsNetworkDialogOpen(false);
    setIsNoNetworkDialogOpen(false);
  };

  const isPlugPopoverOpen =
    userPreferences.connectionPlugPopover?.open &&
    userPreferences.connectionPlugPopover?.isInitial &&
    userPreferences.connectionPlugPopover?.show;

  return (
    <>
      {isAccountConnected && (
        <Button
          variant="text"
          disableRipple
          component="div"
          sx={sxStyles.buttonConnected}
          startIcon={
            <IconButton color="primary" sx={sxStyles.iconButton} onClick={toggleConnection}>
              <IconWalletConnected />
            </IconButton>
          }
          endIcon={
            <>
              <IconButton color="success" sx={sxStyles.iconButton} onClick={handleOpenNetworkDialog}>
                <IconArrowDownIOS />
              </IconButton>
            </>
          }
        >
          <Typography variant="small" width={60} color="success.main" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">
            {network?.name}
          </Typography>
        </Button>
      )}
      {!isAccountConnected && (
        <Stack
          direction="row"
          columnGap={0.1}
          alignItems="center"
          bgcolor={theme.palette.custom.grey["25"]}
          borderRadius="6px"
          py="2px"
          pl="6px"
          pr="2px"
        >
          <Tooltip
            arrow
            open={isPlugPopoverOpen}
            PopperProps={{ sx: sxStyles.plugTooltip }}
            title={
              <Stack rowGap={1}>
                <Typography variant="large" mr={4.5}>
                  You can click on this to connect this wallet.
                </Typography>
                <Stack direction="row" justifyContent="space-between">
                  <CheckboxField onChange={handleDoNotShowPlugPopover} checked={doNotShowPlugPopover} label="Do not show me this again" />
                  <Button onClick={handlePlugPopoverOk} size="small" variant="contained" sx={sxStyles.buttonPopoverOk}>
                    Ok
                  </Button>
                </Stack>
              </Stack>
            }
          >
            <IconButton sx={sxStyles.iconButton} onClick={toggleConnection}>
              <IconWalletDisconnected />
            </IconButton>
          </Tooltip>
          <IconButton sx={sxStyles.iconButton}>
            <IconArrowDownIOS color={theme.palette.text.secondary} />
          </IconButton>
        </Stack>
      )}
      {isNetworkDialogOpen && isAccountConnected && (
        <NetworkSelectModal
          open
          onClose={handleDialogClose}
          onNetworkSelect={handleNetworkSelect}
          selectedNetworkIdentifier={networkIdentifier}
          networks={networks}
        />
      )}
      {domain && isNoNetworkDialogOpen && <HomeAccountCardNotConnected siteName={domain} open onClose={handleDialogClose} />}
    </>
  );
}
