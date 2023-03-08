import { Connection, ISubscription } from "autobahn";

import { Procedure, OneTimeCampaignId, PublishableEvent, SubscribableEvent, Level, Reward } from "../types";

export interface RewardSystemContextValue {
  initialize: (accountAddress: string, uuid: string) => void;
  connection: Connection | null;
  isOpen: boolean;
  open: () => Promise<true | string | null>;
  close: () => Promise<true | string | null>;
  publish: (event: PublishableEvent, args?: any[], kwargs?: any) => Promise<void>;
  subscribe: (event: SubscribableEvent, handler: (args?: any[], kwargs?: any) => void) => Promise<ISubscription | null>;
  call: <ProcedureResponse>(procedure: Procedure, args?: any[], kwargs?: any) => Promise<ProcedureResponse | null> | null;
  level: Level | null;
  levels: Level[] | null;
  points: number | null;
  rewards: Reward[] | null;
  referralLink: string | null;
  refereesCount: number | null;
  oneTimeCampaignIdsTriggered: Set<OneTimeCampaignId>;
  triggerOneTimeCampaign: (campaignId: OneTimeCampaignId, args?: any[], kwargs?: any) => Promise<void>;
}
