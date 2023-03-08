import { NamedExoticComponent } from "react";

import { ThemeProvider, CssBaseline } from "@mui/material";
import { Theme } from "@mui/material/styles";

import { RewardSystemContextProvider } from "ui/common/rewardSystem";

import { theme as defaultTheme } from "ui/common/theme";

import { PersistentRouter } from "ui/common/history";

import RootErrorBoundary from "./RootErrorBoundary";

import { initErrorHandlers } from "./sentry";

initErrorHandlers();

export interface RootProps {
  App: NamedExoticComponent<{}>;
  theme?: Theme;
}

export default function Root(props: RootProps) {
  const { App, theme } = props;

  return (
    <ThemeProvider theme={theme ?? defaultTheme}>
      <PersistentRouter>
        <RootErrorBoundary>
          <RewardSystemContextProvider>
            <App />
          </RewardSystemContextProvider>
        </RootErrorBoundary>
      </PersistentRouter>
      <CssBaseline />
    </ThemeProvider>
  );
}
