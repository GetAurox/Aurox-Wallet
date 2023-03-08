import { useCallback } from "react";

import { ONBOARDING_FILENAME, ONBOARDING_URL } from "common/entities";

export function useOpenOnboarding() {
  const openOnboarding = useCallback(async () => {
    const currentlyOpenedOnboardingTab = await chrome.tabs.query({ url: ONBOARDING_URL });

    if (currentlyOpenedOnboardingTab[0]) {
      const { id, windowId } = currentlyOpenedOnboardingTab[0];

      if (typeof id === "number") {
        await chrome.windows.update(windowId, { focused: true });
        await chrome.tabs.update(id, { active: true, highlighted: true });
      }

      window.close();

      return;
    }

    await chrome.tabs.create({ url: ONBOARDING_FILENAME });
  }, []);

  return { openOnboarding };
}
