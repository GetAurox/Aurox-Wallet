import { useEffect, useState } from "react";

import { getCurrentTab } from "common/chrome";

export function useCurrentTabId() {
  const [tabId, setTabId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const getTab = async () => {
      try {
        const tab = await getCurrentTab();

        if (typeof tab?.id !== "number") return;

        if (mounted) {
          setTabId(tab.id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getTab();

    return () => {
      mounted = false;
    };
  }, []);

  return tabId;
}
