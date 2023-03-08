import { useEffect } from "react";

import { useLocation } from "react-router-dom";

import { trackPage } from "ui/components/common/Root/sentry";

export function useTrackPageToSentry() {
  const location = useLocation();

  useEffect(() => {
    trackPage(location);
  }, [location]);
}
