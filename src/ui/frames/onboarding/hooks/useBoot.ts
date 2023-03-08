import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useIsWalletSetup } from "ui/hooks";

export function useBoot() {
  const isWalletSetup = useIsWalletSetup();

  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (isWalletSetup && location.pathname !== "/congratulations") {
      navigate("/congratulations");
    }
  }, [isWalletSetup, location.pathname, navigate]);
}
