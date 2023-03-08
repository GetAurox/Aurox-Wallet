import "common/bootstrap";
import "ui/common/mock";

import { memo, useEffect } from "react";
import { render } from "react-dom";

import { useIsWalletUnlocked, useDetectScroll, useTrackPageToSentry } from "ui/hooks";

import { useHistoryReset } from "ui/common/history";
import { useInitializeRewardSystem } from "ui/common/rewardSystem";

import Root from "ui/components/common/Root";

import { setupTickers } from "ui/common/connections";

import RouterSchema from "./RouterSchema";
import { useBoot } from "./hooks";

const App = memo(function App() {
  const { ready } = useBoot();
  const reset = useHistoryReset();
  const isWalletUnlocked = useIsWalletUnlocked();

  useTrackPageToSentry();

  useDetectScroll();

  useEffect(() => {
    setupTickers();
  }, []);

  useEffect(() => {
    if (isWalletUnlocked) {
      reset("/operation-controller");
    } else {
      reset("/login");
    }
  }, [isWalletUnlocked, reset]);

  useInitializeRewardSystem();

  if (!ready) {
    return null;
  }

  return <RouterSchema />;
});

render(<Root App={App} />, document.getElementById("app"));

if ((module as any).hot) {
  (module as any).hot.accept();
}
