import { useEffect, useState } from "react";

import { StackProps, IconButton, Stack } from "@mui/material";

import {
  Notifications as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  LockOpen as LockOpenIcon,
} from "@mui/icons-material";

import { Notifications } from "common/operations";
import { Password } from "common/operations";

import { useHistoryReset } from "ui/common/history";
import { IconFullScreen, IconAuroxLogo } from "ui/components/icons";

const sxStyles = {
  iconButton: {
    padding: 0,
  },
};

export type HomeHeaderProps = StackProps;

export default function HomeHeader(props: HomeHeaderProps) {
  const reset = useHistoryReset();

  const [notificationsAllowed, setNotificationsAllowed] = useState<boolean | null>(null);

  const handleFullScreen = () => {
    // TODO: implemenetation
  };

  useEffect(() => {
    const check = async () => {
      const allowed = await Notifications.CheckNotificationsSupport.perform();

      setNotificationsAllowed(allowed);
    };

    check();
  }, []);

  const handleLock = async () => {
    await Password.Lockdown.perform();

    reset("/login");
  };

  const handleChangeNotificationsPermissions = async () => {
    if (!notificationsAllowed) {
      const granted = await Notifications.RequestNotificationsSupport.perform();

      setNotificationsAllowed(granted);
    } else {
      const removed = await Notifications.RemoveNotificationsSupport.perform();

      setNotificationsAllowed(!removed);
    }
  };

  return (
    <Stack direction="row" px={2} py={1} alignItems="center" columnGap={2.25} justifyContent="space-between" {...props}>
      <IconAuroxLogo />
      <Stack direction="row" alignItems="right" columnGap={1}>
        {notificationsAllowed !== null && (
          <IconButton
            sx={sxStyles.iconButton}
            onClick={handleChangeNotificationsPermissions}
            title={`Push notifications are ${notificationsAllowed ? "enabled" : "disabled"}`}
          >
            {notificationsAllowed ? <NotificationsIcon color="primary" /> : <NotificationsOffIcon color="error" />}
          </IconButton>
        )}
        <IconButton sx={sxStyles.iconButton} onClick={handleLock}>
          <LockOpenIcon color="primary" />
        </IconButton>
      </Stack>
    </Stack>
  );
}
