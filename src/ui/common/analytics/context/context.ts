import { createContext } from "react";
import { Analytics } from "@segment/analytics-next";

export interface AnalyticsContextProps {
  analytics: Analytics | undefined;
}

const defaultAnalyticsContext = {
  analytics: undefined,
};

export const AnalyticsContext = createContext<AnalyticsContextProps>(defaultAnalyticsContext);
