import { useEffect } from "react";

import { blockingRequests } from "common/utils";

export function useBlockingRequest() {
  useEffect(() => {
    blockingRequests(true);

    return () => {
      blockingRequests(false);
    };
  }, []);
}
