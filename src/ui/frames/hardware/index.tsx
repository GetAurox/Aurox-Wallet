import "common/bootstrap";

import "ui/common/mock";

import { memo, useState } from "react";

import { render } from "react-dom";

import { HardwareSignerType } from "common/types";

import { useDetectScroll, useHardwareState, useTrackPageToSentry } from "ui/hooks";

import Root from "ui/components/common/Root";

import HardwareSelection from "./components/HardwareSelection";
import WalletSelection from "./components/WalletSelection";
import HardwareOperationLoader from "./components/HardwareOperationLoader";

const App = memo(function App() {
  const [hardwareWallet, setHardwareWallet] = useState<HardwareSignerType | undefined>();

  const hardwareOperation = useHardwareState();

  useTrackPageToSentry();

  useDetectScroll();

  if (hardwareOperation?.operation) {
    return <HardwareOperationLoader operation={hardwareOperation.operation} />;
  }

  if (!hardwareWallet) {
    return <HardwareSelection onClickContinue={(selection: HardwareSignerType) => selection && setHardwareWallet(selection)} />;
  }

  return <WalletSelection hardwareWallet={hardwareWallet} handleReturn={() => setHardwareWallet(undefined)} />;
});

render(<Root App={App} />, document.getElementById("app"));

if ((module as any).hot) {
  (module as any).hot.accept();
}
