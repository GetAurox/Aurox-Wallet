import clamp from "lodash/clamp";

import { REWARD_AFFILIATE_REFERRAL_LINK_COOKIE_NAME, REWARD_AFFILIATE_REFERRAL_LINK_DOMAIN } from "common/config";

import { REWARD_LEVELS_STATIC_DATA } from "./data";

import { Level, RewardLevelData } from "./types";

const formatter = new Intl.NumberFormat("en", { useGrouping: true });

export function getRewardSystemAllLevelsData(levels?: Level[] | null, points?: number | null): RewardLevelData[] {
  if (!levels || levels.length !== REWARD_LEVELS_STATIC_DATA.length || typeof points !== "number") {
    return REWARD_LEVELS_STATIC_DATA;
  }

  const rewardLevelsData: RewardLevelData[] = [];

  for (let index = 0; index < REWARD_LEVELS_STATIC_DATA.length; index += 1) {
    const staticLevelData = REWARD_LEVELS_STATIC_DATA[index];
    const level = levels[index];
    const previousLevel = levels[index - 1] ?? null;

    const pointsToUnlock = level.reward_points_to_unlock;
    const previousLevelPointsToUnlock = previousLevel?.reward_points_to_unlock ?? 0;

    const levelSize = pointsToUnlock - previousLevelPointsToUnlock;

    const isLocked = points < pointsToUnlock;

    const progress = clamp(Math.round(((points - previousLevelPointsToUnlock) * 1000) / levelSize) / 10, 0, 100);
    const subTitle = `${formatter.format(clamp(points - previousLevelPointsToUnlock, 0, levelSize))}/${formatter.format(levelSize)}`;

    rewardLevelsData.push({
      ...staticLevelData,
      pointsToUnlock,
      levelSize,
      subTitle,
      isLocked,
      progress,
    });
  }

  return rewardLevelsData;
}

function getLevelIndex(entity: "current" | "next", rewardLevelsData?: RewardLevelData[] | null, points?: number | null): number | null {
  if (!rewardLevelsData || typeof points !== "number") {
    // forcefully return 0 in case of "next" level request
    return entity === "next" ? 0 : null;
  }

  let levelIndex: number | null = null;
  const levelsCount = rewardLevelsData.length;

  for (let index = 0; index < levelsCount; index += 1) {
    if (points >= rewardLevelsData[index].pointsToUnlock) {
      levelIndex = index;

      continue;
    }

    break;
  }

  if (entity === "next") {
    if (levelIndex === null) {
      return 0;
    } else {
      levelIndex += 1;
    }
  }

  if (levelIndex === null) {
    return null;
  }

  return clamp(levelIndex, 0, levelsCount - 1);
}

export function getRewardSystemCurrentLevelIndex(rewardLevelsData?: RewardLevelData[] | null, points?: number | null) {
  return getLevelIndex("current", rewardLevelsData, points);
}

export function getRewardSystemCurrentLevelData(rewardLevelsData?: RewardLevelData[] | null, points?: number | null) {
  if (!rewardLevelsData) {
    return null;
  }

  const currentLevelIndex = getRewardSystemCurrentLevelIndex(rewardLevelsData, points);

  if (currentLevelIndex === null) {
    return null;
  }

  return rewardLevelsData[currentLevelIndex];
}

export function getRewardSystemNextLevelIndex(rewardLevelsData?: RewardLevelData[] | null, points?: number | null) {
  // forcefully return first level data for "next" level request
  return getLevelIndex("next", rewardLevelsData, points) ?? 0;
}

export function getRewardSystemNextLevelData(rewardLevelsData?: RewardLevelData[] | null, points?: number | null) {
  if (!rewardLevelsData) {
    return REWARD_LEVELS_STATIC_DATA[0];
  }

  return rewardLevelsData[getRewardSystemNextLevelIndex(rewardLevelsData, points)];
}

export async function getAffiliateReferralLink() {
  let link = null;

  try {
    const cookies = await chrome.cookies.getAll({ domain: REWARD_AFFILIATE_REFERRAL_LINK_DOMAIN });

    const cookie = cookies.find(cookie => cookie.name === REWARD_AFFILIATE_REFERRAL_LINK_COOKIE_NAME);

    if (cookie) {
      link = cookie.value;
    }
  } catch (error) {
    console.error(error);
  }

  return link;
}
