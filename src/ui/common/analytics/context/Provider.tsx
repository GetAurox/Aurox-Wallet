import { useState, useEffect, ReactNode } from "react";
import { AnalyticsBrowser, Analytics } from "@segment/analytics-next";

import { SEGMENT_ANALYTICS_WRITE_KEY } from "common/config";

import { AnalyticsContext } from "./context";

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const [analytics, setAnalytics] = useState<Analytics>();

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!SEGMENT_ANALYTICS_WRITE_KEY || analytics) {
        return;
      }

      const [response] = await AnalyticsBrowser.load({ writeKey: SEGMENT_ANALYTICS_WRITE_KEY });

      setAnalytics(response);
    };

    loadAnalytics();
  }, [analytics]);

  return <AnalyticsContext.Provider value={{ analytics }}>{children}</AnalyticsContext.Provider>;
};
