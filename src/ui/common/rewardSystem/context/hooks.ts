import { useContext } from "react";

import { RewardSystemContext } from "./RewardSystemContext";

export function useRewardSystemContext() {
  return useContext(RewardSystemContext);
}
