import { ReactNode, useMemo, useCallback, useState, useEffect } from "react";
import produce from "immer";
import { ISubscription, Session, OnChallengeHandler } from "autobahn";
import { ethers } from "ethers";

import { Wallet } from "common/operations";

import { RewardSystem } from "ui/common/rewardSystem/RewardSystem";
import {
  Procedure,
  OneTimeCampaignId,
  PublishableEvent,
  SubscribableEvent,
  Level,
  Reward,
  ProcedureResponseMap,
} from "ui/common/rewardSystem/types";

import { getAffiliateReferralLink } from "ui/common/rewardSystem/utils";

import { ONE_TIME_CAMPAIGN_IDS, ONE_TIME_CAMPAIGN_ID_EVENT_MAPPING } from "../config";

import { RewardSystemContext } from "./RewardSystemContext";
import { RewardSystemContextValue } from "./types";

interface RewardSystemContextProviderProps {
  children?: ReactNode;
}

export function RewardSystemContextProvider(props: RewardSystemContextProviderProps) {
  const { children } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [instance, setInstance] = useState<RewardSystem | null>(null);
  const [oneTimeCampaignIdsManuallyTriggered, setOneTimeCampaignIdsManuallyTriggered] = useState<OneTimeCampaignId[]>([]);

  const [level, setLevel] = useState<Level | null>(null);
  const [levels, setLevels] = useState<Level[] | null>(null);
  const [points, setPoints] = useState<number | null>(null);
  const [rewards, setRewards] = useState<Reward[] | null>(null);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [refereesCount, setRefereesCount] = useState<{
    tier1RefereesCount: number | null;
    tier2RefereesCount: number | null;
    tier3RefereesCount: number | null;
  } | null>(null);

  const initialize = useCallback(async (address: string, uuid: string) => {
    async function onChallenge(session: Session, method: string, extra: any) {
      if (method !== "ethersign") {
        throw new Error("Unknown authentication method");
      }

      if (!uuid) {
        throw new Error("No root account UUID");
      }

      const signatureHex = await Wallet.SignMessage.perform({
        chainType: "evm",
        message: ethers.utils.sha256(extra.challenge),
        uuid,
        shouldArrayify: true,
      });

      return signatureHex;
    }

    const referralLink = await getAffiliateReferralLink();

    setInstance(
      new RewardSystem({
        userId: address,
        onChallenge: onChallenge as unknown as OnChallengeHandler,
        referralLink,
      }),
    );
  }, []);

  const open = useCallback(async () => {
    return new Promise<true | string>((resolve, reject) => {
      try {
        if (instance?.connection) {
          instance.connection.onopen = () => {
            setIsOpen(true);

            resolve(true);
          };

          !isOpen && instance.connection.open();
        } else {
          reject("No active connection");
        }
      } catch (error) {
        console.error("Failed to open connection", error);

        reject(`Cannot open connection. Reason: ${error.message}`);
      }
    });
  }, [instance, isOpen]);

  const close = useCallback(async () => {
    return new Promise<true | string>((resolve, reject) => {
      try {
        if (instance?.connection) {
          instance.connection.onclose = () => {
            setIsOpen(false);
            setInstance(null);

            resolve(true);

            return true;
          };

          isOpen && instance.connection.close();
        } else {
          reject("No active connection");
        }
      } catch (error) {
        console.error("Failed to close connection", error);

        reject(`Cannot close connection. Reason: ${error.message}`);
      }
    });
  }, [instance, isOpen]);

  const publish = useCallback(
    async function (event: PublishableEvent, args?: any[], kwargs?: any) {
      try {
        if (instance?.connection && isOpen) {
          await instance.connection.session?.publish(event, args, kwargs);
        }

        return;
      } catch (error) {
        console.error("Failed to execute 'publish'", error);

        return;
      }
    },
    [instance, isOpen],
  );

  const triggerOneTimeCampaign = useCallback(
    async function (campaignId: OneTimeCampaignId, args?: any[], kwargs?: any) {
      const event = ONE_TIME_CAMPAIGN_ID_EVENT_MAPPING[campaignId];

      await publish(event, args, kwargs);

      setOneTimeCampaignIdsManuallyTriggered(
        produce(draft => {
          if (!draft.includes(campaignId)) {
            draft.push(campaignId);
          }
        }),
      );

      return;
    },
    [publish],
  );

  const subscribe = useCallback(
    async (event: SubscribableEvent, handler: (args?: any[], kwargs?: any) => void) => {
      try {
        if (instance?.connection && isOpen) {
          return (await instance.connection.session?.subscribe(event, handler)) ?? null;
        }

        return null;
      } catch (error) {
        console.error("Failed to execute 'subscribe'", error);

        return null;
      }
    },
    [instance, isOpen],
  );

  const call = useCallback(
    async function <ProcedureResponse>(procedure: Procedure, args?: any[], kwargs?: any) {
      try {
        if (instance?.connection && isOpen) {
          return (await instance.connection.session?.call<ProcedureResponse>(procedure, args, kwargs)) ?? null;
        }

        return null;
      } catch (error) {
        console.error("Failed to execute 'call'", error);

        return null;
      }
    },
    [instance, isOpen],
  );

  // Fetching level, levels, points and reward initially
  useEffect(() => {
    let mounted = true;

    const execProcedures = async () => {
      try {
        const result = await Promise.allSettled<
          [
            Promise<ProcedureResponseMap["aurox.my.get_level"] | null>,
            Promise<ProcedureResponseMap["aurox.my.get_levels"] | null>,
            Promise<ProcedureResponseMap["aurox.my.get_points"] | null>,
            Promise<ProcedureResponseMap["aurox.my.get_rewards"] | null>,
            Promise<ProcedureResponseMap["aurox.my.get_referral_link"] | null>,
            Promise<ProcedureResponseMap["aurox.my.get_referees_count"] | null>,
          ]
        >([
          call("aurox.my.get_level"),
          call("aurox.my.get_levels"),
          call("aurox.my.get_points"),
          call("aurox.my.get_rewards"),
          call("aurox.my.get_referral_link"),
          call("aurox.my.get_referees_count"),
        ]);

        if (!mounted) return;

        if (result[0].status === "fulfilled") {
          setLevel(result[0].value?.kwargs.level ?? null);
        }

        if (result[1].status === "fulfilled") {
          // Pre-order levels A-Z by points needed for unlocking
          const levelsUnordered = result[1].value?.kwargs.levels;
          const levelsOrdered = levelsUnordered?.sort((a, b) => a.reward_points_to_unlock - b.reward_points_to_unlock);

          setLevels(levelsOrdered ?? null);
        }

        if (result[2].status === "fulfilled") {
          setPoints(result[2].value?.kwargs.points ?? null);
        }

        if (result[3].status === "fulfilled") {
          setRewards(result[3].value?.kwargs.rewards ?? null);
        }

        if (result[4].status === "fulfilled") {
          setReferralLink(result[4].value?.kwargs.referral_link ?? null);
        }

        if (result[5].status === "fulfilled") {
          setRefereesCount(
            result[5].value?.kwargs
              ? {
                  tier1RefereesCount: result[5].value?.kwargs.tier1_referees_count ?? null,
                  tier2RefereesCount: result[5].value?.kwargs.tier2_referees_count ?? null,
                  tier3RefereesCount: result[5].value?.kwargs.tier3_referees_count ?? null,
                }
              : null,
          );
        }
      } catch (error) {
        console.error("Failed to execute procedure(s)", error);
      }
    };

    if (instance?.connection && isOpen) {
      execProcedures();
    }

    return () => {
      mounted = false;
    };
  }, [instance, isOpen, call]);

  // Updating points and rewards as user executes one timers
  useEffect(() => {
    let mounted = true;
    let subscription: ISubscription | null = null;

    const handleUpdate = (args: any, kwargs: { reward: Reward }) => {
      if (kwargs.reward && mounted) {
        setPoints(old => {
          if (!old) {
            return kwargs.reward.points;
          }

          return old + kwargs.reward.points;
        });

        setRewards(
          produce(draft => {
            if (!draft) {
              return [kwargs.reward];
            }

            draft.push(kwargs.reward);
          }),
        );
      }
    };

    const performMyRewardSubscription = async () => {
      subscription = await subscribe("aurox.my.reward", handleUpdate);
    };

    if (instance?.connection && isOpen) {
      performMyRewardSubscription();
    }

    return () => {
      if (subscription && subscription.active && subscription.session.isOpen) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error("Failed to unsubscribe", error);
        }
      }

      mounted = false;
    };
  }, [instance, isOpen, subscribe]);

  // Collecting all triggered one time campaign ids in order to prevent triggering them again
  const oneTimeCampaignIdsTriggered: Set<OneTimeCampaignId> = useMemo(
    () => new Set(oneTimeCampaignIdsManuallyTriggered),
    [oneTimeCampaignIdsManuallyTriggered],
  );

  if (rewards) {
    for (const reward of rewards) {
      const oneTimeCampaignId = reward.campaign.id as OneTimeCampaignId;

      if (ONE_TIME_CAMPAIGN_IDS.includes(oneTimeCampaignId) && !oneTimeCampaignIdsTriggered.has(oneTimeCampaignId)) {
        oneTimeCampaignIdsTriggered.add(oneTimeCampaignId);
      }
    }
  }

  const value = useMemo<RewardSystemContextValue>(
    () => ({
      initialize,
      connection: instance?.connection ?? null,
      isOpen,
      open,
      close,
      publish,
      subscribe,
      call,
      level,
      levels,
      points,
      rewards,
      refereesCount,
      oneTimeCampaignIdsTriggered,
      triggerOneTimeCampaign,
      referralLink,
    }),
    [
      initialize,
      instance,
      isOpen,
      open,
      close,
      publish,
      subscribe,
      call,
      level,
      levels,
      points,
      rewards,
      refereesCount,
      oneTimeCampaignIdsTriggered,
      triggerOneTimeCampaign,
      referralLink,
    ],
  );

  return <RewardSystemContext.Provider value={value}>{children}</RewardSystemContext.Provider>;
}
