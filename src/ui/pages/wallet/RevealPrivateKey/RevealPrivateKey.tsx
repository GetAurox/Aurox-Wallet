import { useState, useEffect, FocusEvent } from "react";

import { Box, Button, Typography, Theme } from "@mui/material";

import { Password, Wallet } from "common/operations";

import { useGoHome, useHistoryGoBack, useHistoryPathParams } from "ui/common/history";

import PasswordField from "ui/components/form/PasswordField";
import Header from "ui/components/layout/misc/Header";

import WarningIcon from "@mui/icons-material/Warning";

type RevealPrivateKeyStep = "confirm-password" | "warning" | "reveal";

const sxStyles = {
  passwordField: {
    helper: {
      "&.MuiFormHelperText-root": {
        color: "error.main",
      },
    },
  },
};

export default function RevealPrivateKey() {
  const { id } = useHistoryPathParams<"id">();

  const goBack = useHistoryGoBack();
  const goHome = useGoHome();

  const [step, setStep] = useState<RevealPrivateKeyStep>("confirm-password");

  const [countDown, setCountDown] = useState(5);

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [privateKey, setPrivateKey] = useState("");

  useEffect(() => {
    if (countDown > 0 && step === "warning") {
      const warningCountDown = setInterval(() => {
        setCountDown(oldState => oldState - 1);
      }, 1000);
      return () => clearInterval(warningCountDown);
    }
  }, [countDown, step]);

  const cleanUpAndGoBack = () => {
    setPassword("");
    setPrivateKey("");

    goBack();
  };

  const confirmPassword = async () => {
    if (!password) return;

    const { valid } = await Password.ProbePassword.perform(password);

    if (!valid) {
      setPasswordError("Wrong Password");
      return;
    }

    setStep("warning");
  };

  const confirmWarning = async () => {
    if (!id) return;

    setStep("reveal");

    const { privateKey } = await Wallet.ExportPrivateKey.perform({ uuid: id, chainType: "evm", password });

    setPrivateKey(privateKey);
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

  const onClickClose = () => {
    setPassword("");
    setPrivateKey("");

    goHome();
  };

  return (
    <>
      <Header title="Reveal Private Key" onBackClick={cleanUpAndGoBack} />

      {step === "confirm-password" && (
        <Box flex={1} display="flex" flexDirection="column" p={2}>
          <Typography fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px" mb={3}>
            Confirm Password
          </Typography>
          <PasswordField
            value={password}
            visibilityControl
            error={!!passwordError}
            sx={sxStyles.passwordField}
            onBlur={handlePasswordBlur}
            placeholder="Enter Password"
            onClear={handlePasswordClear}
            helper={passwordError && passwordError}
            onChange={e => setPassword(e.target.value)}
          />
          <Box flexGrow={1} />
          <Button variant="contained" onClick={confirmPassword}>
            Confirm Password
          </Button>
        </Box>
      )}

      {step === "warning" && (
        <Box flex={1} display="flex" flexDirection="column" p={2}>
          <Box display="flex" justifyContent="center">
            <WarningIcon fontSize="large" color="warning" />
            <Typography fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px" mb={3} ml={1}>
              Warning!
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center">
            <Typography fontSize="14px" align="center">
              Make sure nobody is looking at your screen.
            </Typography>
          </Box>
          <Box display="flex" justifyContent="center">
            <Typography fontSize="14px" align="center">
              Never share your private key with anyone!
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Button variant="contained" onClick={confirmWarning} disabled={countDown > 0} sx={{ my: 2 }}>
            Reveal Private Key{countDown === 0 ? "" : ` in ${countDown} seconds`}
          </Button>
          <Button variant="outlined" onClick={cleanUpAndGoBack}>
            Go Back
          </Button>
        </Box>
      )}

      {step === "reveal" && (
        <Box flex={1} display="flex" flexDirection="column" p={2}>
          <Typography fontWeight={500} fontSize="24px" lineHeight="32px" letterSpacing="0.18px" mb={3}>
            Your Private Key
          </Typography>
          <Box display="flex">
            <WarningIcon fontSize="small" color="warning" />
            <Typography fontSize="14px" ml={1}>
              Never share your private key with anyone!
            </Typography>
          </Box>
          <Box sx={{ background: (theme: Theme) => theme.palette.custom.grey["19"], p: 2, borderRadius: "14px", mt: 2 }}>
            <Typography fontSize="14px" align="center" sx={{ wordBreak: "break-all" }}>
              {privateKey}
            </Typography>
          </Box>
          <Box flexGrow={1} />
          <Button variant="contained" onClick={onClickClose}>
            Close
          </Button>
        </Box>
      )}
    </>
  );
}
