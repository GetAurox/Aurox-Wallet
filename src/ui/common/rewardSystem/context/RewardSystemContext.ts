import { createContext } from "react";
import noop from "lodash/noop";

import { RewardSystemContextValue } from "./types";

export const RewardSystemContext = createContext<RewardSystemContextValue>({
  initialize: noop,
  connection: null,
  isOpen: false,
  open: () => Promise.resolve(true),
  close: () => Promise.resolve(true),
  publish: () => Promise.resolve(),
  subscribe: () => Promise.resolve(null),
  call: () => null,
  level: null,
  levels: null,
  points: null,
  rewards: null,
  referralLink: null,
  refereesCount: null,
  oneTimeCampaignIdsTriggered: new Set(),
  triggerOneTimeCampaign: () => Promise.resolve(),
});
