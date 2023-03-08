import { ChangeEvent, useRef, useEffect, useState } from "react";

import { Stack } from "@mui/material";

import { IconArrow } from "ui/components/icons";
import CommonListItem from "ui/components/common/CommonListItem";

import { useRewardSystemNextLevelIndex, useRewardSystemAllLevelsData } from "ui/common/rewardSystem";

import { useHistoryPush } from "ui/common/history";

import { defaultTheme } from "ui/common/theme";

import ProfileRewardsPoints from "./ProfileRewardsPoints";
import ProfileRewardsLevels from "./ProfileRewardsLevels";
import ProfileRewardsBenefits from "./ProfileRewardsBenefits";
import ProfileRewardsMoreInfo from "./ProfileRewardsMoreInfo";

const sxStyles = {
  commonListItem: {
    listItemText: {
      ml: 2,
    },
    listItem: {
      border: `1px solid ${defaultTheme.palette.custom.blue["58"]}`,
    },
  },
};

export default function ProfileRewards() {
  const paginated = useRef(false);

  const push = useHistoryPush();

  const [activeLevelIndex, setActiveLevelIndex] = useState(0);

  const rewardSystemNextLevelIndex = useRewardSystemNextLevelIndex();
  const rewardSystemAllLevelsData = useRewardSystemAllLevelsData();

  const level = rewardSystemAllLevelsData[activeLevelIndex];

  const handleLevelChange = (event: ChangeEvent<unknown>, page: number) => {
    paginated.current = true;
    setActiveLevelIndex(page - 1);
  };

  const handleOpenInvitePage = () => {
    push("/invite");
  };

  useEffect(() => {
    if (!paginated.current) {
      setActiveLevelIndex(rewardSystemNextLevelIndex);
    }
  }, [rewardSystemNextLevelIndex]);

  return (
    <>
      <ProfileRewardsLevels isLocked={level.isLocked} activeLevelIdentity={level.identity} onLevelChange={handleLevelChange} />
      <Stack rowGap="21px" mt={2.25}>
        <CommonListItem
          endIcon={<IconArrow />}
          sx={sxStyles.commonListItem}
          primaryLabel="Invite a friend and earn"
          secondaryLabel="Earn lifetime commission on every person you refer to Aurox"
          onClick={handleOpenInvitePage}
        />
        <ProfileRewardsBenefits isLocked={level.isLocked} activeLevelIdentity={level.identity} />
        <ProfileRewardsPoints isLocked={level.isLocked} />
        <ProfileRewardsMoreInfo />
      </Stack>
    </>
  );
}
