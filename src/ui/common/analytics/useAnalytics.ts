import { useCallback } from "react";

import useAnalyticsContext from "./context/useAnalyticsContext";
import { ButtonsToTrack, PagesToTrack } from "./types";

const useAnalytics = () => {
  const { analytics } = useAnalyticsContext();

  const pageViewed = useCallback(
    (name: PagesToTrack, category?: string) => {
      analytics?.page(category, name);
    },
    [analytics],
  );

  const trackButtonClicked = useCallback(
    (event: ButtonsToTrack) => {
      analytics?.track(event);
    },
    [analytics],
  );

  const identifyUser = useCallback(
    (name: string) => {
      analytics?.identify({
        name,
      });
    },
    [analytics],
  );

  return {
    pageViewed,
    identifyUser,
    trackButtonClicked,
  };
};

export default useAnalytics;
