import { MouseEvent, useState } from "react";

import { Button, List, Stack } from "@mui/material";

import { autoLockValues } from "common/config";

import { useHistoryGoBack } from "ui/common/history";

import { IconRadioOn, IconRadioOff } from "ui/components/icons";
import ListItem from "ui/components/common/CommonListItem";
import Header from "ui/components/layout/misc/Header";

export default function IdleTimeout() {
  const [autoLock, setAutoLock] = useState(autoLockValues[0].value);

  const goBack = useHistoryGoBack();

  const handleClick = (event: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) => {
    setAutoLock(event.currentTarget.id);
  };

  const handleSave = () => {
    // TODO: implementation
  };

  return (
    <>
      <Header title="Idle Timeout" onBackClick={goBack} />
      <List disablePadding>
        {autoLockValues.map((item, index) => (
          <ListItem
            id={item.value}
            key={item.value}
            onClick={handleClick}
            dividerVariant="middle"
            primaryLabel={item.label}
            divider={autoLockValues.length !== index + 1}
            startIcon={autoLock === item.value ? <IconRadioOn /> : <IconRadioOff />}
          />
        ))}
      </List>
      <Stack m={2} flexGrow={1} justifyContent="end">
        <Button onClick={handleSave} disabled={autoLock === "TODO: add implementation"} variant="contained">
          Save
        </Button>
      </Stack>
    </>
  );
}
