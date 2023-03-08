import "common/bootstrap";
import "ui/common/mock";

import { memo } from "react";
import { render } from "react-dom";

import Root from "ui/components/common/Root";
import { useInitializeRewardSystem } from "ui/common/rewardSystem";
import { theme } from "ui/frames/onboarding/theme";

import RouterSchema from "./RouterSchema";
import { ViewPortSizeUpdater } from "./components";

import { RegistrationProgressContextProvider } from "./context";

const App = memo(function App() {
  useInitializeRewardSystem();

  return (
    <RegistrationProgressContextProvider>
      <RouterSchema />
      <ViewPortSizeUpdater />
    </RegistrationProgressContextProvider>
  );
});

render(<Root App={App} theme={theme} />, document.getElementById("app"));

if ((module as any).hot) {
  (module as any).hot.accept();
}
