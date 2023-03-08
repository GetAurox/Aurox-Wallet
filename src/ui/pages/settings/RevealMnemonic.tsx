import { useState, useEffect, FocusEvent } from "react";

import { Theme, Box, Button, Typography, AccordionSummary, AccordionDetails, Accordion, Stack } from "@mui/material";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";

import { Password, Wallet } from "common/operations";

import { useHistoryGoBack } from "ui/common/history";
import { useBlockingRequest } from "ui/hooks";

import PasswordField from "ui/components/form/PasswordField";
import { IconStatusWarning } from "ui/components/icons";
import Header from "ui/components/layout/misc/Header";
import AlertStatus from "ui/components/common/AlertStatus";
import DefaultControls from "ui/components/controls/DefaultControls";

type RevealMnemonicStep = "confirm-password" | "warning" | "reveal";

const sxStyles = {
  passwordField: {
    helper: {
      "&.MuiFormHelperText-root": {
        color: "error.main",
      },
    },
  },
  box: {
    background: (theme: Theme) => theme.palette.custom.grey["19"],
    p: 2,
    borderRadius: "14px",
    mt: 2,
    minHeight: 176,
  },
  accordionRoot: {
    backgroundColor: "transparent",
    boxShadow: "none",
    "&:before": {
      backgroundColor: "transparent",
    },
  },
};

export default function RevealMnemonic() {
  const [step, setStep] = useState<RevealMnemonicStep>("confirm-password");

  const [password, setPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [countDown, setCountDown] = useState(5);

  const [mnemonics, setMnemonics] = useState<string[]>([]);

  useBlockingRequest();

  useEffect(() => {
    if (countDown > 0 && step === "warning") {
      const warningCountDown = setInterval(() => {
        setCountDown(oldState => oldState - 1);
      }, 1000);
      return () => clearInterval(warningCountDown);
    }
  }, [countDown, step]);

  const goBack = useHistoryGoBack();

  const handleGoBack = () => {
    setPassword("");
    setMnemonics([]);

    goBack();
  };

  const confirmPassword = async () => {
    if (!password) {
      return;
    }

    const { valid } = await Password.ProbePassword.perform(password);

    if (!valid) {
      setPasswordError("Wrong Password");
      return;
    }

    setStep("warning");
  };

  const confirmWarning = async () => {
    const { mnemonics } = await Wallet.ExportAllMnemonics.perform({ password });
    setMnemonics(mnemonics);
    setStep("reveal");
  };

  const handlePasswordBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setPasswordError("");
    }
  };

  const handlePasswordClear = () => {
    setPassword("");
    setPasswordError("");
  };

  return (
    <>
      <Header title="Secret Recovery Phrase" onBackClick={handleGoBack} />

      {step === "confirm-password" && (
        <Box flex={1} display="flex" flexDirection="column" p={2}>
          <Typography fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px" mb={3}>
            Confirm Your Password
          </Typography>
          <PasswordField
            value={password}
            error={!!passwordError}
            label="Current Password"
            onBlur={handlePasswordBlur}
            sx={sxStyles.passwordField}
            placeholder="Enter Password"
            onClear={handlePasswordClear}
            visibilityControl={password !== ""}
            helper={passwordError && passwordError}
            onChange={e => setPassword(e.target.value)}
          />
          <Box flexGrow={1} />
          <Button variant="contained" onClick={confirmPassword} disabled={password === ""}>
            Confirm
          </Button>
        </Box>
      )}

      {step === "warning" && (
        <Box flex={1} display="flex" flexDirection="column" p={2}>
          <Box display="flex" justifyContent="center">
            <Typography fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px" mb={3} ml={1}>
              Warning!
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center">
            <IconStatusWarning fontSize="medium" color="warning" />
            <Typography fontSize="16px" paddingLeft="8px">
              Make sure nobody is looking at your screen.
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Button variant="contained" onClick={confirmWarning} sx={{ my: 2 }} disabled={countDown > 0}>
            Continue{countDown === 0 ? "" : ` in ${countDown} seconds`}
          </Button>
          <Button variant="outlined" onClick={handleGoBack}>
            Go Back
          </Button>
        </Box>
      )}

      {step === "reveal" && (
        <Box flex={1} display="flex" flexDirection="column" p={2}>
          <Typography fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px" mb={2}>
            Your Secret Recovery {mnemonics.length > 1 ? "Phrases" : "Phrase"}
          </Typography>

          {mnemonics.length === 1 && (
            <>
              <Stack direction="row">
                <IconStatusWarning fontSize="small" color="warning" />
                <Typography fontSize="16px" ml={1}>
                  Don&apos;t share your Secret Recovery
                  <br /> Phrase with anyone.
                </Typography>
              </Stack>
              <Box sx={sxStyles.box}>
                <Typography fontSize="16px" sx={{ wordBreak: "break-word" }}>
                  {mnemonics}
                </Typography>
              </Box>
            </>
          )}

          {mnemonics.length > 1 && (
            <>
              <AlertStatus warning warningText="Multiple wallets were imported. Click on the names below to view the recovery phrases." />

              <Box mt={3}>
                {mnemonics.map((mnemonic, index) => (
                  <Accordion sx={sxStyles.accordionRoot} disableGutters key={index}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>{index === 0 ? "Main Wallet" : `Imported Wallet #${index + 1}`}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={sxStyles.box}>
                        <Typography fontSize="16px" sx={{ wordBreak: "break-word" }}>
                          {mnemonic}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </>
          )}

          <DefaultControls mx={-2} primary={"Close"} onPrimary={handleGoBack} />
        </Box>
      )}
    </>
  );
}
