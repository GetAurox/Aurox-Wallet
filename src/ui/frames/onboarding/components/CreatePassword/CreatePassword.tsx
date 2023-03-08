import { MouseEvent, useCallback, useEffect, useState } from "react";

import { Alert, Box, Button, Grid, Typography } from "@mui/material";

import { useTimeCounter, useValidatePassword } from "ui/hooks";

import { Icon } from "ui/frames/onboarding/components/Icon";
import { PasswordField } from "ui/frames/onboarding/components/PasswordField";
import { ValidationCriterion } from "ui/frames/onboarding/components/ValidationCriterion";

import { CheckboxField } from "ui/frames/onboarding/components/CheckboxField";

interface CreatePasswordProps {
  onSubmit: (password: string) => void;
  terms?: boolean;
  onPasswordReady: (ready: boolean) => void;
}

export const CreatePassword = (props: CreatePasswordProps) => {
  const { onSubmit, terms = false, onPasswordReady } = props;

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { validations, passwordValid, password, passwordConfirm, handlePasswordChange, handlePasswordConfirmChange } =
    useValidatePassword();

  const { set, finished } = useTimeCounter();

  const handleTermsAgreedToggle = useCallback(() => setTermsAgreed(value => !value), []);

  const handleOnSubmit = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      setIsSubmitting(true);
      onSubmit(password);
    },
    [onSubmit, password],
  );

  const termsValid = terms ? termsAgreed : true;

  useEffect(() => {
    onPasswordReady(passwordValid && termsValid);
  }, [onPasswordReady, passwordValid, termsValid]);

  useEffect(() => {
    if (isSubmitting) {
      set(5);
    }
  }, [isSubmitting, set]);

  useEffect(() => {
    if (finished) {
      setIsSubmitting(false);
    }
  }, [finished, set]);

  return (
    <>
      <Typography component="h3" mt={3} variant="h200-bs">
        Create a new password
      </Typography>

      <Box component="form" mt={4}>
        <Grid container gap={2}>
          <PasswordField fullWidth name="password" placeholder="New password" onChange={handlePasswordChange} value={password} />
          <ValidationCriterion requirements={Object.values(validations)} touched={password !== ""} />
          <PasswordField
            fullWidth
            name="passwordConfirmation"
            placeholder="Confirm password"
            onChange={handlePasswordConfirmChange}
            value={passwordConfirm}
          />
          <Grid item xs={12}>
            {terms ? (
              <Box bgcolor="rgba(255, 184, 119, 0.2)" borderRadius="16px" mb={2} mt={3} p={2} width="100%">
                <CheckboxField
                  label="I understand that Aurox can't recover this password for me."
                  name="confirm"
                  onClick={handleTermsAgreedToggle}
                  disableRipple={false}
                />
              </Box>
            ) : (
              <Box width="100%">
                <Alert icon={<Icon name="24px-warning" />} severity="warning">
                  Keep your recovery phrase in a safe place and don&apos;t share it with anyone!
                </Alert>
              </Box>
            )}
          </Grid>

          <Button
            disabled={!passwordValid || !termsValid || isSubmitting}
            fullWidth
            type="submit"
            variant="contained"
            onClick={handleOnSubmit}
          >
            Complete
          </Button>
        </Grid>
      </Box>
    </>
  );
};
