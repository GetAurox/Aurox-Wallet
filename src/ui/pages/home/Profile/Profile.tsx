import { SyntheticEvent } from "react";

import { Tab, Tabs, Typography } from "@mui/material";

import { useHistoryState } from "ui/common/history";

import ProfileSettings from "./ProfileSettings";
import ProfileRewards from "./ProfileRewards";

export default function Profile() {
  const [tab, setTab] = useHistoryState("profileTab", 0);

  const handleTabChange = (event: SyntheticEvent, newTab: number) => setTab(newTab);

  return (
    <>
      <Typography component="h1" fontWeight={500} mt={2.5} fontSize={24} align="center">
        My Aurox
      </Typography>

      <Tabs variant="fullWidth" value={tab} onChange={handleTabChange}>
        <Tab tabIndex={0} label="Rewards" />
        <Tab tabIndex={1} label="Settings" />
      </Tabs>

      {tab === 0 && <ProfileRewards />}
      {tab === 1 && <ProfileSettings />}
    </>
  );
}
