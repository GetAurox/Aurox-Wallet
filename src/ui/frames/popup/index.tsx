import "common/bootstrap";

import "ui/common/mock";

import "./hardwareFix";

import "normalize.css";

import { memo, useEffect } from "react";
import { render } from "react-dom";
import produce from "immer";

import { Stack } from "@mui/material";

import { defaultUserPreferences } from "common/storage";
import { DEFAULT_POPUP_WIDTH, DEFAULT_POPUP_HEIGHT } from "common/manifest";

import {
  useDAppOperations,
  useFocusRestoration,
  useIsWalletUnlocked,
  useDetectScroll,
  useCurrentTabDappConnectionInfo,
  useLocalUserPreferences,
  useTrackPageToSentry,
} from "ui/hooks";
import { ConnectionPlugPopover } from "ui/types";

import { useHistoryReset } from "ui/common/history";
import { useInitializeRewardSystem } from "ui/common/rewardSystem";
import { setupTickers, setupOHLCV } from "ui/common/connections";
import { AccountsAutoImportContextProvider } from "ui/common/accountsAutoImport";

import Root from "ui/components/common/Root";

import RouterSchema from "./RouterSchema";
import { useBoot } from "./hooks";

const App = memo(function App() {
  const { ready } = useBoot();

  const reset = useHistoryReset();
  const dappOperations = useDAppOperations();
  const isWalletUnlocked = useIsWalletUnlocked();
  const [, setUserPreferences] = useLocalUserPreferences();
  const { domain, tabId } = useCurrentTabDappConnectionInfo();

  useTrackPageToSentry();

  useFocusRestoration();

  useDetectScroll();

  useEffect(() => {
    setupTickers();
    setupOHLCV();
  }, []);

  useEffect(() => {
    setUserPreferences(
      produce(draft => {
        if (!draft.connectionPlugPopover) {
          draft.connectionPlugPopover = defaultUserPreferences.connectionPlugPopover as ConnectionPlugPopover;
        }

        draft.connectionPlugPopover.isInitial = true;
      }),
    );
  }, [setUserPreferences]);

  useInitializeRewardSystem();

  useEffect(() => {
    if (ready && isWalletUnlocked && dappOperations && dappOperations.length > 0) {
      const currentTabHasOperations = dappOperations.some(operation => operation.domain === domain && operation.tabId === tabId);

      if (currentTabHasOperations) {
        reset("/operation-controller");
      }
    }
  }, [dappOperations, isWalletUnlocked, ready, reset, domain, tabId]);

  if (!ready) {
    return null;
  }

  return (
    <Stack
      minWidth={DEFAULT_POPUP_WIDTH}
      maxWidth={DEFAULT_POPUP_WIDTH}
      height={DEFAULT_POPUP_HEIGHT}
      component="main"
      position="relative"
      bgcolor="background.default"
      sx={{ overflowX: "hidden" }}
    >
      <AccountsAutoImportContextProvider>
        <RouterSchema />
      </AccountsAutoImportContextProvider>
    </Stack>
  );
});

render(<Root App={App} />, document.getElementById("app"));

if ((module as any).hot) {
  (module as any).hot.accept();
}
