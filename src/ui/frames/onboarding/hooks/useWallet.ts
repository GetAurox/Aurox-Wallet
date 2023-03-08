import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useOnboardingData } from "ui/hooks";
import { OneTimeCampaignId, useRewardSystemContext } from "ui/common/rewardSystem";

import { WalletSetupMethod } from "common/types";
import { AUROX_TUTORIALS_PAGE_URL } from "common/config";
import { Password, Wallet, ENS } from "common/operations";

export function useWallet(username: string) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [walletCreated, setWalletCreated] = useState(false);
  const [collectedCampaignIds, setCollectedCampaignIds] = useState<OneTimeCampaignId[]>([]);

  const { update: updateOnboardingData, data: onboardingData } = useOnboardingData();

  const { oneTimeCampaignIdsTriggered, triggerOneTimeCampaign, isOpen, rewards } = useRewardSystemContext();

  const enqueueOneTimeCampaignIds = useCallback(
    (queue: OneTimeCampaignId[]) => {
      const campaignIdsToQueue: OneTimeCampaignId[] = [];

      for (const campaignId of queue) {
        if (!collectedCampaignIds.includes(campaignId)) {
          campaignIdsToQueue.push(campaignId);
        }
      }

      if (campaignIdsToQueue.length > 0) {
        setCollectedCampaignIds(events => [...events, ...campaignIdsToQueue]);
      }
    },
    [collectedCampaignIds],
  );

  const handleNavigate = () => {
    updateOnboardingData({ step: "main" });
    if (onboardingData?.step !== "completed") {
      navigate("/");
    }
  };
  const handleNextStep = useCallback((step = 1) => {
    setStep(prevStep => prevStep + step);
  }, []);

  const handlePrevStep = useCallback((step = 1) => setStep(prevStep => prevStep - step), []);

  const handleSetupWallet = async (setupMethod: WalletSetupMethod, password: string, mnemonics: string[], name?: string) => {
    setCreatingWallet(true);

    try {
      if (name === undefined) {
        name = "Account 1";
      }

      await Password.CreatePassword.perform(password);
      await Wallet.Setup.perform(setupMethod, mnemonics, name);

      if (setupMethod === "create") {
        const result = await ENS.AddENS.perform(username);

        if (!result.status) {
          throw new Error(result.error || "Unknown Error");
        }
      }

      updateOnboardingData({ step: "completed" });
      setWalletCreated(true);
    } catch (e) {
      setError(e.message);
    }

    setCreatingWallet(false);
  };

  // Handling collected campaign ids during registration
  const handleTriggerCollectedRewards = useCallback(async () => {
    const campaignIdsToTrigger: OneTimeCampaignId[] = [];

    for (const campaignId of collectedCampaignIds) {
      if (!oneTimeCampaignIdsTriggered.has(campaignId)) {
        campaignIdsToTrigger.push(campaignId);
      }
    }

    if (campaignIdsToTrigger.length > 0) {
      await Promise.allSettled(campaignIdsToTrigger.map(event => triggerOneTimeCampaign(event)));
    }
  }, [oneTimeCampaignIdsTriggered, triggerOneTimeCampaign, collectedCampaignIds]);

  useEffect(() => {
    const process = async () => {
      setCreatingWallet(true);

      try {
        await handleTriggerCollectedRewards();
      } catch (e) {
        setError(e.message);
      }

      setCreatingWallet(false);

      window.location.href = AUROX_TUTORIALS_PAGE_URL;
    };

    // Awaiting for reward system to activate, open connection, etc.
    if (isOpen && rewards && walletCreated) {
      process();
    }
  }, [isOpen, rewards, walletCreated, handleTriggerCollectedRewards, username]);

  return {
    handleNavigate,
    handleNextStep,
    handlePrevStep,
    handleSetupWallet,
    step,
    error,
    creatingWallet,
    setError,
    setCreatingWallet,
    enqueueOneTimeCampaignIds,
  };
}
