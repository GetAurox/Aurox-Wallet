import { memo } from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import { ImportWallet } from "./pages/ImportWallet";
import { NewWalletPage } from "./pages/NewWallet";
import { SignInPage } from "./pages/SignIn";
import { InnerWalletPageLayout } from "./pages/WalletLayout";
import Congratulations from "./pages/Congratulations";

export default memo(function RouterSchema() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/import-wallet" element={<InnerWalletPageLayout page={<ImportWallet />} />} />
      <Route path="/new-wallet" element={<InnerWalletPageLayout page={<NewWalletPage />} />} />
      <Route path="/sign-in" element={<InnerWalletPageLayout page={<SignInPage />} />} />
      <Route path="/congratulations" element={<Congratulations />} />
    </Routes>
  );
});
