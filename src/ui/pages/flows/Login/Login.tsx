import { useCallback, useState, ChangeEvent, FocusEvent, FormEvent, useEffect, useMemo } from "react";
import capitalize from "lodash/capitalize";

import { Box, Button, Stack } from "@mui/material";

import { DApp as DAppOps, Password } from "common/operations";
import { DApp as DAppEvents } from "common/events";
import { Operation } from "common/types";

import useAnalytics from "ui/common/analytics";
import { useGoHome, useHistoryPush } from "ui/common/history";

import { useCurrentTabDappConnectionInfo, useCurrentTabDomain, useDAppOperations, useOnboardingData } from "ui/hooks";

import SplashLogo from "ui/components/common/SplashLogo";
import PasswordField from "ui/components/form/PasswordField";
import WalletSelectorModal from "ui/components/modals/WalletSelectorModal";

const sxStyles = {
  passwordField: {
    helper: {
      "&.MuiFormHelperText-root": {
        color: "error.main",
      },
    },
  },
};

export interface LoginProps {
  windowPopup?: boolean;
}

export default function Login(props: LoginProps) {
  const { windowPopup } = props;

  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [paginationIndex, setPaginationIndex] = useState(1);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const [shouldConsiderOtherProvider, setShouldConsiderOtherProvider] = useState(false);

  const goHome = useGoHome();
  const push = useHistoryPush();

  const { trackButtonClicked } = useAnalytics();

  const { getUserSubdomain } = useOnboardingData();
  const tabDomain = useCurrentTabDomain();

  const { domain, tabId } = useCurrentTabDappConnectionInfo();

  const operations = useDAppOperations(!windowPopup ? { domain, tabId } : {});

  useEffect(() => {
    if (!operations || operations.length === 0) {
      return;
    }

    if (operations.length > 0 && paginationIndex > operations.length) {
      setPaginationIndex(operations.length);
      setSelectedOperation(operations[operations.length - 1]);
    } else {
      setSelectedOperation(operations[paginationIndex - 1]);
    }
  }, [operations, windowPopup, paginationIndex]);

  useEffect(() => {
    if (selectedOperation && selectedOperation.operationType === "connect") {
      setShouldConsiderOtherProvider(selectedOperation.considerOtherProvider);
    }
  }, [selectedOperation]);

  const handleLogin = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();

      const { verified } = await Password.Authenticate.perform(password);

      if (!verified) {
        setPasswordError("Wrong Password");

        return;
      }

      setPassword("");

      if (selectedOperation?.operationType === "connect") {
        push("/operation-controller", { alreadyConsidered: true });
      } else {
        goHome();
      }
    },
    [password, selectedOperation?.operationType, push, goHome],
  );

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
    setPasswordError("");
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

  const handleAuroxProviderSelected = async () => {
    if (!selectedOperation) return;

    const domain = selectedOperation.domain || tabDomain;

    if (!domain) return;

    await DAppOps.ChangeConnectionPolicy.perform({
      considerOtherProvider: false,
      isDefaultProvider: true,
      tabId: selectedOperation.tabId,
      domain,
    });

    trackButtonClicked("Connected with Aurox");

    setShouldConsiderOtherProvider(false);
  };

  const handleOtherProviderSelected = async () => {
    if (!selectedOperation) return;

    const domain = selectedOperation.domain || tabDomain;

    if (!domain) return;

    await DAppOps.ChangeConnectionPolicy.perform({
      considerOtherProvider: true,
      isDefaultProvider: false,
      tabId: selectedOperation.tabId,
      domain,
    });

    DAppEvents.TransactionRequestResponded.broadcast(selectedOperation.id, { accountUUID: "", networkIdentifier: "" });

    trackButtonClicked("Connected with Metamask");

    setShouldConsiderOtherProvider(false);
  };

  const username = useMemo(() => getUserSubdomain(), [getUserSubdomain]);

  return (
    <>
      <Stack
        flex={1}
        noValidate
        component="form"
        autoComplete="off"
        alignItems="center"
        onSubmit={handleLogin}
        justifyContent="space-between"
      >
        <SplashLogo heading={username ? `Welcome ${capitalize(username)}` : "Welcome to Aurox"} />
        <Box mb={2} px={2} width={1}>
          <PasswordField
            value={password}
            visibilityControl
            error={!!passwordError}
            sx={sxStyles.passwordField}
            onBlur={handlePasswordBlur}
            placeholder="Enter Password"
            onClear={handlePasswordClear}
            onChange={handlePasswordChange}
            helper={passwordError && passwordError}
          />
          <Button sx={{ mt: 2 }} variant="contained" fullWidth type="submit">
            Login
          </Button>
        </Box>
      </Stack>
      <WalletSelectorModal
        open={shouldConsiderOtherProvider}
        onAuroxProviderSelect={handleAuroxProviderSelected}
        onOtherProviderSelect={handleOtherProviderSelected}
      />
    </>
  );
}
