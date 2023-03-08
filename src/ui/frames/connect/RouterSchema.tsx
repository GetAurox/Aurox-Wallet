import { Route, Routes } from "react-router-dom";
import { memo } from "react";

import SetupWallet from "ui/pages/flows/SetupWallet";
import Login from "ui/pages/flows/Login";
import OperationController from "ui/pages/dapp/OperationController";

export default memo(function RouterSchema() {
  return (
    <Routes>
      <Route path="/setup-wallet" element={<SetupWallet />} />
      <Route path="/login" element={<Login windowPopup />} />

      <Route path="/operation-controller" element={<OperationController windowPopup />} />
    </Routes>
  );
});
