import { ChangeEvent } from "react";

import { Button, Pagination, Stack, Typography } from "@mui/material";

import RewardsAvatar from "ui/components/entity/rewards/RewardsAvatar";

import { mixSx } from "ui/common/utils";
import { defaultTheme } from "ui/common/theme";
import { LevelIdentity, useRewardSystemCurrentLevelData, useRewardSystemAllLevelsData } from "ui/common/rewardSystem";

const sxStyles = {
  pagination: {
    margin: 2,
    display: "flex",
    justifyContent: "center",
    ".MuiButtonBase-root": {
      "&.Mui-selected": {
        backgroundColor: defaultTheme.palette.custom.grey["19"],
      },
    },
  },
  avatar: {
    display: "none",
  },
  avatarLeft: {
    ml: 10.25,
  },
  avatarRight: {
    mr: 10.25,
  },
  avatarFirst: {
    ml: 26,
  },
  avatarLast: {
    mr: 26,
  },
  level: {
    px: 1,
    py: 0.5,
    mt: 2.25,
    mx: "auto",
    fontWeight: 500,
    borderRadius: "4px",
  },
  currentLevelText: {
    letterSpacing: 0,
    fontSize: "11px",
    lineHeight: "16px",
    color: defaultTheme.palette.custom.grey["60"],
    border: `1px solid ${defaultTheme.palette.custom.grey["60"]}`,
  },
};

export interface ProfileRewardsLevelsProps {
  activeLevelIdentity: LevelIdentity;
  isLocked?: boolean;
  onLevelChange: (event: ChangeEvent<unknown>, page: number) => void;
}

export default function ProfileRewardsLevels(props: ProfileRewardsLevelsProps) {
  const { onLevelChange, activeLevelIdentity, isLocked } = props;

  const rewardSystemLevelData = useRewardSystemCurrentLevelData();
  const rewardSystemAllLevelsData = useRewardSystemAllLevelsData();

  const levelsCount = rewardSystemAllLevelsData.length;
  const activeLevelIndex = rewardSystemAllLevelsData.findIndex(({ identity }) => identity === activeLevelIdentity);
  const activeLevelData = rewardSystemAllLevelsData[activeLevelIndex];
  const lockedColor = defaultTheme.palette.custom.grey[30];

  const getAvatarSx = (index: number) => {
    if (index + 1 === activeLevelIndex) {
      return sxStyles.avatarRight;
    }

    if (index - 1 === activeLevelIndex) {
      return sxStyles.avatarLeft;
    }

    if (index === activeLevelIndex && index == 0) {
      return sxStyles.avatarFirst;
    }

    if (index === activeLevelIndex && index == levelsCount - 1) {
      return sxStyles.avatarLast;
    }

    return index !== activeLevelIndex ? sxStyles.avatar : {};
  };

  const handleChangeToCurrentLevel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    onLevelChange(event, rewardSystemAllLevelsData.findIndex(level => level.identity === rewardSystemLevelData?.identity) + 1);
  };

  return (
    <>
      <Stack justifyContent="center" direction="row" mt={4}>
        {rewardSystemAllLevelsData.map(({ progress, isLocked, iconSrc: { normal, disabled } }, index) => (
          <RewardsAvatar key={index} size="large" sx={getAvatarSx(index)} progress={progress} src={isLocked ? disabled : normal} />
        ))}
      </Stack>

      <Stack mt={2}>
        <Typography variant="headingSmall" textAlign="center" color={isLocked ? lockedColor : undefined}>
          {activeLevelData.title}
        </Typography>
        <Typography variant="large" textAlign="center" color={isLocked ? lockedColor : "text.secondary"}>
          {activeLevelData.subTitle}
        </Typography>
        {rewardSystemLevelData && rewardSystemLevelData.identity === activeLevelData.identity && !rewardSystemLevelData.isLocked && (
          <Typography sx={mixSx(sxStyles.currentLevelText, sxStyles.level)}>Your current level</Typography>
        )}
        {rewardSystemLevelData?.identity !== activeLevelData.identity && (
          <Button
            size="small"
            variant="outlined"
            sx={sxStyles.level}
            disabled={!rewardSystemLevelData}
            onClick={handleChangeToCurrentLevel}
          >
            Return to Current Level
          </Button>
        )}
      </Stack>

      <Pagination
        size="small"
        color="standard"
        page={activeLevelIndex + 1}
        count={levelsCount}
        onChange={onLevelChange}
        sx={sxStyles.pagination}
      />
    </>
  );
}
