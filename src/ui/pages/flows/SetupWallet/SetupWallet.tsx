import { memo, useState } from "react";

import { Box, Button } from "@mui/material";

import { Password, Wallet } from "common/operations";
import { generateMnemonics } from "common/bip39";

import { useHistoryReset } from "ui/common/history";

import CreatePassword from "ui/components/fragments/CreatePassword";
import { WelcomeScreen, Flow } from "ui/components/layout/flow";
import SplashLogo from "ui/components/common/SplashLogo";
import Success from "ui/components/layout/misc/Success";

import { WalletSetupMethod } from "common/types";

import ConfirmRecoveryPhrase from "./ConfirmRecoveryPhrase";
import ImportRecoveryPhrase from "./ImportRecoveryPhrase";
import ViewRecoveryPhrase from "./ViewRecoveryPhrase";

export default memo(function SetupWallet() {
  const reset = useHistoryReset();

  const [stage, setStage] = useState<null | "password" | "phrase" | "phrase-confirm" | "completed">(null);

  const [action, setAction] = useState<null | WalletSetupMethod>(null);

  const [password, setPassword] = useState<null | string>(null);
  const [mnemonics, setMnemonics] = useState<null | string[]>(null);

  const [creatingWallet, setCreatingWallet] = useState(false);

  const [walletName, setWalletName] = useState("");

  const handleCreateNewWalletClick = () => {
    setStage("password");
    setAction("create");
  };

  const handleImportWalletClick = () => {
    setStage("password");
    setAction("import");
  };

  const handleClose = () => {
    setStage(null);
    setAction(null);
    setPassword(null);
    setMnemonics(null);
  };

  const handleBackFromPhrase = () => {
    setStage("password");
    setPassword(null);
  };

  const handleBackFromPhraseConfirm = () => setStage("phrase");
  const handleNextFromPhraseView = () => setStage("phrase-confirm");
  const handlePasswordCreated = (password: string) => {
    setStage("phrase");
    setPassword(password);
    setMnemonics(mnemonics => (mnemonics ? mnemonics : generateMnemonics()));
  };

  const handleSetupWallet = async (setupMethod: WalletSetupMethod, name: string, password: string, mnemonics: string[]) => {
    const sanitizedName = name.trim() || "Account 1";

    setStage("completed");
    setCreatingWallet(true);
    setWalletName(sanitizedName);

    await Password.CreatePassword.perform(password);

    await Wallet.Setup.perform(setupMethod, mnemonics, sanitizedName);

    setCreatingWallet(false);
  };

  const handleCreateWalletComplete = (name: string) => password && mnemonics && handleSetupWallet("create", name, password, mnemonics);

  const handleWalletImportAccepted = (name: string, mnemonics: string[]) =>
    password && handleSetupWallet("import", name, password, mnemonics);

  const handleWalletSetupCompleteClick = () => reset(action === "import" ? "/accounts-auto-import" : "/");

  const title = action === "create" ? "Create a New Wallet" : "Import Wallet";
  const steps = action === "create" ? 3 : 2;

  if (stage === "password") {
    return (
      <Flow currentStep={1} totalSteps={steps} onClose={handleClose} title={title}>
        <CreatePassword onPasswordConfirmed={handlePasswordCreated} />
      </Flow>
    );
  }

  if (stage === "phrase") {
    return (
      <Flow currentStep={2} totalSteps={steps} onClose={handleClose} onBack={handleBackFromPhrase} title={title}>
        {action === "create" && <ViewRecoveryPhrase mnemonics={mnemonics} onNext={handleNextFromPhraseView} />}
        {action === "import" && <ImportRecoveryPhrase onWalletAccepted={handleWalletImportAccepted} />}
      </Flow>
    );
  }

  if (stage === "phrase-confirm") {
    return (
      <Flow currentStep={3} totalSteps={3} onClose={handleClose} onBack={handleBackFromPhraseConfirm} title={title}>
        <ConfirmRecoveryPhrase mnemonics={mnemonics} onComplete={handleCreateWalletComplete} />
      </Flow>
    );
  }

  if (stage === "completed") {
    return (
      <Success
        heading="Complete"
        subheading={`Your wallet "${walletName}" was successfully ${action === "create" ? "created" : "imported"}.`}
        buttonDisabled={creatingWallet}
        onButtonClick={handleWalletSetupCompleteClick}
      />
    );
  }

  return (
    <WelcomeScreen>
      <SplashLogo heading="Welcome to Aurox" subheading="Please Select an Option Below" />
      <Box mb={2} px={2} width={1}>
        <Button variant="contained" fullWidth color="primary" onClick={handleCreateNewWalletClick}>
          Create a New Wallet
        </Button>

        <Button sx={{ mt: 1.5 }} variant="outlined" fullWidth onClick={handleImportWalletClick}>
          Import Wallet
        </Button>
      </Box>
    </WelcomeScreen>
  );
});
