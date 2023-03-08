import { useCallback, useEffect, useState } from "react";

import { loadOnboardingData, saveOnboardingData } from "common/storage";
import { OnboardingHistoryStateValues } from "common/types";
import { getSubdomain } from "common/utils/domain";

const defaultData: OnboardingHistoryStateValues = {
  step: "main",
  username: "",
};

export function useOnboardingData() {
  const [data, setData] = useState<OnboardingHistoryStateValues | null>(null);

  const { username = "" } = data ?? {};

  useEffect(() => {
    const initialize = async () => {
      const data = await loadOnboardingData<OnboardingHistoryStateValues>();

      if (data) {
        setData(prevState => ({ ...prevState, ...data }));
      }
    };

    initialize();
  }, []);

  const update = useCallback(async (state: Partial<OnboardingHistoryStateValues>) => {
    setData(prevState => {
      if (prevState?.step === "completed" && state.step && state.step !== "completed") {
        console.error("Wallet already setup");

        return prevState;
      }

      const updateStorage = async () => {
        await saveOnboardingData({ ...prevState, ...state });
      };

      updateStorage();

      return { ...defaultData, ...prevState, ...state };
    });
  }, []);

  const reset = useCallback(async () => {
    setData(() => {
      const resetStorage = async () => {
        await saveOnboardingData(null);
      };

      resetStorage();

      return null;
    });
  }, []);

  const getUserSubdomain = useCallback(() => {
    if (!username || username.length === 0) {
      return null;
    }

    return getSubdomain(username);
  }, [username]);

  return { data, update, reset, getUserSubdomain };
}
