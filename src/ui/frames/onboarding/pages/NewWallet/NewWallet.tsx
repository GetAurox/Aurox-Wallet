import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, IconButton, Stack, Typography } from "@mui/material";

import { generateMnemonics } from "common/bip39";

import { Icon, ValidationCriterionItem } from "ui/frames/onboarding/components";
import { CreateUsername } from "ui/frames/onboarding/components/CreateUsername";
import { CreatePassword } from "ui/frames/onboarding/components/CreatePassword";
import { useRegistrationProgressContext } from "ui/frames/onboarding/context";
import { useWallet } from "ui/frames/onboarding/hooks";

import { useOnboardingData } from "ui/hooks";

import { RecoveryPhrase } from "./components/RecoveryPhrase";
import { RecoveryPhraseForm } from "./components/RecoveryPhraseForm";

export function NewWalletPage() {
  const { data: onboardingData, update: updateOnboardingData } = useOnboardingData();

  const [password, setPassword] = useState<null | string>(null);
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const [, setPasswordReady] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);

  const navigate = useNavigate();

  const { handleNavigate, handleNextStep, handlePrevStep, handleSetupWallet, step, error, creatingWallet, enqueueOneTimeCampaignIds } =
    useWallet(onboardingData?.username ?? "");

  const { setProgress } = useRegistrationProgressContext();

  useEffect(() => {
    if (onboardingData?.step === "completed") {
      navigate("/congratulations");
    }
  }, [navigate, onboardingData?.step]);

  useEffect(() => {
    if (step === 1) {
      setProgress({ totalPoints: 0, action: "Create username", getPoints: 1000, percent: 5 });
    } else if (step === 2) {
      setProgress({ totalPoints: 1000, action: "Create password", getPoints: 500, percent: 50 });
      enqueueOneTimeCampaignIds(["username_created"]);
    } else if (step === 4) {
      if (recoveryReady) {
        setProgress({ totalPoints: 2000, action: null, getPoints: 0, percent: 100 });
        enqueueOneTimeCampaignIds(["username_created", "password_created", "add_wallet"]);
      } else {
        setProgress({ totalPoints: 1500, action: "Enter recovery phrase", getPoints: 500, percent: 75 });
        enqueueOneTimeCampaignIds(["username_created", "password_created"]);
      }
    }
  }, [step, recoveryReady, setProgress, enqueueOneTimeCampaignIds]);

  const updateUsername = (username: string) => {
    updateOnboardingData({ username: username });
  };

  const handlePassword = (password: string) => {
    handleNextStep();
    setPassword(password);
    setMnemonics(() => generateMnemonics());
  };

  const handlePhrase = () => {
    password && mnemonics && handleSetupWallet("create", password, mnemonics);
  };

  return (
    <>
      <Stack alignItems="center" direction="row" justifyContent="space-between">
        <Stack alignItems="center" direction="row">
          {step === 1 ? (
            <IconButton color="info" LinkComponent="a" onClick={handleNavigate}>
              <Icon name="24px-arrow-left-long" />
            </IconButton>
          ) : (
            <IconButton color="info" onClick={() => handlePrevStep()}>
              <Icon name="24px-arrow-left-long" />
            </IconButton>
          )}
          <Typography component="h2" ml={2} variant="h200-xl">
            Create wallet
          </Typography>
        </Stack>
        <Typography color="txt600" variant="p400-xl">
          Step {step} of 4
        </Typography>
      </Stack>

      {step === 1 && <CreateUsername onSubmit={handleNextStep} state={onboardingData} updateUsername={updateUsername} />}
      {step === 2 && <CreatePassword onSubmit={handlePassword} terms onPasswordReady={setPasswordReady} />}
      {step === 3 && <RecoveryPhrase mnemonics={mnemonics} onSubmit={handleNextStep} />}
      {step === 4 && (
        <RecoveryPhraseForm
          mnemonics={mnemonics}
          onSubmit={handlePhrase}
          disableSubmitButton={creatingWallet}
          onRecoveryReady={setRecoveryReady}
        />
      )}

      {error && (
        <Box mt={2}>
          <ValidationCriterionItem text={error} touched />
        </Box>
      )}
    </>
  );
}
