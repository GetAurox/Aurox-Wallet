import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, IconButton, Stack, Typography } from "@mui/material";

import { mnemonicsToString } from "common/bip39";
import { getAddressByMnemonics, getAddressENSData } from "common/api";

import { Icon, ValidationCriterionItem } from "ui/frames/onboarding/components";
import { CreateUsername } from "ui/frames/onboarding/components/CreateUsername";
import { CreatePassword } from "ui/frames/onboarding/components/CreatePassword";
import { useRegistrationProgressContext } from "ui/frames/onboarding/context";
import { useWallet } from "ui/frames/onboarding/hooks";

import { useOnboardingData } from "ui/hooks";

import { Phrase } from "./components/Phrase";

export function ImportWallet() {
  const [name, setName] = useState("");
  const [mnemonics, setMnemonics] = useState<string[] | null>(null);
  const [hasENSAddress, setHasENSAddress] = useState(false);
  const [passwordReady, setPasswordReady] = useState(false);

  const navigate = useNavigate();

  const { data: onboardingData, update: updateOnboardingData } = useOnboardingData();

  const {
    handleNavigate,
    handleNextStep,
    handlePrevStep,
    step,
    error,
    creatingWallet,
    handleSetupWallet,
    setError,
    setCreatingWallet,
    enqueueOneTimeCampaignIds,
  } = useWallet(!hasENSAddress && onboardingData?.username ? onboardingData.username : "");

  const { setProgress } = useRegistrationProgressContext();

  useEffect(() => {
    if (onboardingData?.step === "completed") {
      navigate("/congratulations");
    }
  }, [navigate, onboardingData?.step]);

  useEffect(() => {
    if (step === 1) {
      setProgress({ totalPoints: 0, action: "Enter recovery phrase", getPoints: 500, percent: 5 });
    } else if (step === 2) {
      setProgress({ totalPoints: 500, action: "Create username", getPoints: 1000, percent: 25 });
      enqueueOneTimeCampaignIds(["add_wallet"]);
    } else if (passwordReady) {
      setProgress({ totalPoints: 2000, action: null, getPoints: 0, percent: 100 });
      enqueueOneTimeCampaignIds(["add_wallet", "username_created", "password_created"]);
    } else {
      setProgress({ totalPoints: 1500, action: "Create password", getPoints: 500, percent: 75 });
      enqueueOneTimeCampaignIds(["add_wallet", "username_created"]);
    }
  }, [step, passwordReady, setProgress, enqueueOneTimeCampaignIds]);

  const handlePassword = (password: string) => {
    password && mnemonics && handleSetupWallet("import", password, mnemonics, name);
  };

  const updateUsername = (username: string) => {
    updateOnboardingData({ username });
  };

  const handleOnSubmitPhrases = async (name: string, mnemonics: string[]) => {
    try {
      setCreatingWallet(true);
      setMnemonics(mnemonics);
      setName(name);

      const mnemonicsString = mnemonicsToString(mnemonics);
      const address = await getAddressByMnemonics(mnemonicsString);
      const { isExistedENSAddress, subdomain } = await getAddressENSData(address);

      if (subdomain) {
        updateOnboardingData({ username: subdomain });
      }

      setHasENSAddress(isExistedENSAddress);

      handleNextStep(isExistedENSAddress ? 2 : 1);
    } catch (e) {
      setError(e.message);
    }
    setCreatingWallet(false);
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
            <IconButton color="info" onClick={() => handlePrevStep(hasENSAddress ? 2 : 1)}>
              <Icon name="24px-arrow-left-long" />
            </IconButton>
          )}
          <Typography component="h2" ml={2} variant="h200-xl">
            Import wallet
          </Typography>
        </Stack>
        <Typography color="txt600" variant="p400-xl">
          Step {step} of 3
        </Typography>
      </Stack>

      {step === 1 && <Phrase onSubmit={handleOnSubmitPhrases} disableSubmitButton={creatingWallet} />}
      {step === 2 && <CreateUsername onSubmit={handleNextStep} state={onboardingData} updateUsername={updateUsername} />}
      {step === 3 && <CreatePassword onSubmit={handlePassword} terms onPasswordReady={setPasswordReady} />}

      {error && (
        <Box mt={2}>
          <ValidationCriterionItem text={<>{error} </>} touched />
        </Box>
      )}
    </>
  );
}
