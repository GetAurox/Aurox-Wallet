import { ChangeEvent, useCallback, useEffect, useState } from "react";

import { Box, Button, Stack, Tooltip, Typography, useTheme } from "@mui/material";

import { OnboardingHistoryStateValues } from "common/types";

import { useDebounce, useENSCheckUsername } from "ui/hooks";

import { TextField } from "ui/frames/onboarding/components";
import { IconInfo } from "ui/components/icons";

function onlyLettersAndNumbers(value: string) {
  return /^[A-Za-z0-9]*$/.test(value);
}

export interface CreateUsernameProps {
  onSubmit: () => void;
  state: OnboardingHistoryStateValues | null;
  updateUsername: (username: string) => void;
}

export const CreateUsername = (props: CreateUsernameProps) => {
  const { onSubmit, state, updateUsername } = props;

  const [specialCharWarn, setSpecialCharWarn] = useState(false);

  const username = state?.username ?? "";
  const debouncedUsername = useDebounce(username, 300);
  const theme = useTheme();

  const { valid, error: usernameError } = useENSCheckUsername(debouncedUsername);

  const handleSubmit = useCallback(() => {
    onSubmit();
  }, [onSubmit]);

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!onlyLettersAndNumbers(event.target.value)) {
      setSpecialCharWarn(true);

      return;
    }

    setSpecialCharWarn(false);
    updateUsername(event.target.value);
  };

  useEffect(() => {
    if (usernameError?.isAxiosError) {
      updateUsername("");
      handleSubmit();
    }
  }, [handleSubmit, updateUsername, usernameError]);

  const isValidForm = username !== "" && valid;
  let error: string | null = null;

  if (username !== "" && valid !== null) {
    error = valid ? null : "The username is unavailable";
  }

  return (
    <>
      <Typography component="h3" mt={3} variant="h200-bs">
        Create your unique Aurox ENS username
      </Typography>
      <Typography color="txt600" mb={3} mt="4px" variant="p400-xl">
        ENS usernames are human-readable domain names that other wallets and platforms can use instead of your full wallet address. Aurox
        will provide you with a free and unique ENS username for your wallet address. It will allow you to receive cryptocurrency or NFTs
        via the unique ENS.
      </Typography>
      <Box component="form" mt={4}>
        <Stack gap={2} justifyContent="space-between" minHeight="286px">
          <Box>
            <Tooltip
              arrow
              PopperProps={{ disablePortal: true }}
              placement="top-start"
              open={specialCharWarn}
              title={
                <Stack columnGap={0.5} direction="row">
                  <IconInfo color={theme.palette.warning.main} />
                  <Typography variant="medium" color={theme.palette.warning.main}>
                    Warning: only alphabetical and numeric characters allowed
                  </Typography>
                </Stack>
              }
            >
              <TextField fullWidth name="username" placeholder="ENS Username" onChange={handleOnChange} value={username} caption={error} />
            </Tooltip>
          </Box>

          <Button disabled={!isValidForm} fullWidth type="submit" variant="contained" onClick={handleSubmit}>
            Continue
          </Button>
        </Stack>
      </Box>
    </>
  );
};
