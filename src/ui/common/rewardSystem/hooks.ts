import { useEffect, useMemo } from "react";

import { useRootMnemonicAccountData } from "ui/hooks";

import { useRewardSystemContext } from "./context";
import {
  getRewardSystemAllLevelsData,
  getRewardSystemCurrentLevelIndex,
  getRewardSystemCurrentLevelData,
  getRewardSystemNextLevelIndex,
  getRewardSystemNextLevelData,
} from "./utils";

export function useInitializeRewardSystem() {
  const { initialize, connection, isOpen, open, close } = useRewardSystemContext();

  const rootMnemonicAccountData = useRootMnemonicAccountData();
  const rootMnemonicAccountAdddress = rootMnemonicAccountData?.address;
  const rootMnemonicAccountUUID = rootMnemonicAccountData?.uuid;

  // Authorizing user with his mnemonic derived 0 EVM wallet address as userId
  useEffect(() => {
    if (rootMnemonicAccountAdddress && rootMnemonicAccountUUID) {
      initialize(rootMnemonicAccountAdddress, rootMnemonicAccountUUID);
    }
  }, [initialize, rootMnemonicAccountAdddress, rootMnemonicAccountUUID]);

  // Open connection when wallet gets unlocked
  useEffect(() => {
    if (rootMnemonicAccountData && connection && !isOpen) {
      open();
    }
  }, [rootMnemonicAccountData, connection, isOpen, open]);

  // Close connection when wallet gets locked
  useEffect(() => {
    if (rootMnemonicAccountData === null && connection && isOpen) {
      close();
    }
  }, [rootMnemonicAccountData, connection, isOpen, close]);
}

export function useRewardSystemAllLevelsData() {
  const { levels, points } = useRewardSystemContext();

  return useMemo(() => getRewardSystemAllLevelsData(levels, points), [levels, points]);
}

export function useRewardSystemCurrentLevelIndex() {
  const { points } = useRewardSystemContext();
  const rewardSystemAllLevelsData = useRewardSystemAllLevelsData();

  return useMemo(() => getRewardSystemCurrentLevelIndex(rewardSystemAllLevelsData, points), [rewardSystemAllLevelsData, points]);
}

export function useRewardSystemCurrentLevelData() {
  const { points } = useRewardSystemContext();
  const rewardSystemAllLevelsData = useRewardSystemAllLevelsData();

  return useMemo(() => getRewardSystemCurrentLevelData(rewardSystemAllLevelsData, points), [rewardSystemAllLevelsData, points]);
}

export function useRewardSystemNextLevelIndex() {
  const { points } = useRewardSystemContext();
  const rewardSystemAllLevelsData = useRewardSystemAllLevelsData();

  return useMemo(() => getRewardSystemNextLevelIndex(rewardSystemAllLevelsData, points), [rewardSystemAllLevelsData, points]);
}

export function useRewardSystemNextLevelData() {
  const { points } = useRewardSystemContext();
  const rewardSystemAllLevelsData = useRewardSystemAllLevelsData();

  return useMemo(() => getRewardSystemNextLevelData(rewardSystemAllLevelsData, points), [rewardSystemAllLevelsData, points]);
}

export function useRewardSystemReferralLink() {
  const { referralLink } = useRewardSystemContext();

  return referralLink;
}

export function useRewardSystemRefereesCount() {
  const { refereesCount } = useRewardSystemContext();

  return refereesCount;
}
