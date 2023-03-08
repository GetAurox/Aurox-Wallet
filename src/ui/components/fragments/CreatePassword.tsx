import { memo, useCallback, useState } from "react";

import { Box, Typography, Button, FormControlLabel, Checkbox } from "@mui/material";

import { useBlockingRequest, useValidatePassword } from "ui/hooks";

import { FlowStep, FlowStepHeader, FlowStepBody, FlowStepActions } from "ui/components/layout/flow";
import PasswordField from "ui/components/form/PasswordField";
import Criterion from "ui/components/form/Criterion";

export interface CreatePasswordProps {
  changing?: boolean;
  onPasswordConfirmed: (password: string) => void;
}

export default memo(function CreatePassword(props: CreatePasswordProps) {
  const { changing, onPasswordConfirmed } = props;

  const [termsAgreed, setTermsAgreed] = useState(false);

  const {
    validations,
    passwordValid,
    password,
    passwordConfirm,
    handlePasswordChange,
    handlePasswordConfirmChange,
    handlePasswordClear,
    handlePasswordConfirmClear,
  } = useValidatePassword();

  const handleCreatePasswordClick = useCallback(() => onPasswordConfirmed(password), [password, onPasswordConfirmed]);

  const handleTermsAgreedToggle = useCallback(() => setTermsAgreed(value => !value), []);

  useBlockingRequest();

  const confirmFieldValidator = useCallback((value: string) => !!value && value === password, [password]);

  const termsValid = !!changing || termsAgreed;

  return (
    <FlowStep>
      <FlowStepHeader title={changing ? "Change Password" : "Create Password"} />
      <FlowStepBody>
        <PasswordField
          label="New Password"
          placeholder="Enter Password"
          visibilityControl
          autoFocus
          value={password}
          onChange={handlePasswordChange}
          onClear={handlePasswordClear}
        />
        <Box mt={3}>
          <PasswordField
            label="Confirm Password"
            placeholder="Enter Password"
            visibilityControl
            value={passwordConfirm}
            onChange={handlePasswordConfirmChange}
            onClear={handlePasswordConfirmClear}
            validator={confirmFieldValidator}
          />
        </Box>
        <Box display="flex" flexDirection="column" mt={3} mb={3}>
          <Criterion satisfied={validations.char.value} label={validations.char.label} />
          <Criterion satisfied={validations.min.value} label={validations.min.label} />
          <Criterion satisfied={validations.num.value} label={validations.num.label} />
          <Criterion satisfied={validations.match.value} label={validations.match.label} />
        </Box>
        {!changing && (
          <FormControlLabel
            control={<Checkbox checked={termsAgreed} onChange={handleTermsAgreedToggle} />}
            disableTypography
            label={<Typography variant="body2">I understand that Aurox can’t recover this password for me.</Typography>}
          />
        )}
      </FlowStepBody>
      <FlowStepActions>
        <Button color="primary" variant="contained" fullWidth disabled={!passwordValid || !termsValid} onClick={handleCreatePasswordClick}>
          {changing ? "Change Password" : "Create a New Password"}
        </Button>
      </FlowStepActions>
    </FlowStep>
  );
});
