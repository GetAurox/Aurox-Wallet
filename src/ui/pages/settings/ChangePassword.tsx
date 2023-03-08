import { ChangeEvent, memo, useState } from "react";

import { Button, Typography } from "@mui/material";

import { useGoHome, useHistoryGoBack } from "ui/common/history";
import { Password } from "common/operations";

import { Flow, FlowStep, FlowStepHeader, FlowStepBody, FlowStepActions } from "ui/components/layout/flow";
import CreatePassword from "ui/components/fragments/CreatePassword";
import PasswordField from "ui/components/form/PasswordField";
import Success from "ui/components/layout/misc/Success";
import ErrorText from "ui/components/form/ErrorText";

export default memo(function ChangePassword() {
  const goBack = useHistoryGoBack();
  const goHome = useGoHome();

  const [oldPassword, setOldPassword] = useState("");
  const [oldPasswordConfirming, setOldPasswordConfirming] = useState(false);
  const [oldPasswordValid, setOldPasswordValid] = useState<boolean | null>(null);

  const [changeConfirmed, setChangeConfirmed] = useState(false);
  const [newPasswordBeingCreated, setNewPasswordBeingCreated] = useState(false);

  const handleOldPasswordConfirmChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOldPassword(event.target.value);
    setOldPasswordValid(null);
  };

  const handleOldPasswordConfirmClear = () => {
    setOldPassword("");
    setOldPasswordValid(null);
  };

  const handleOldPasswordConfirmClick = async () => {
    setOldPasswordConfirming(true);

    const { valid } = await Password.ProbePassword.perform(oldPassword);

    setOldPasswordValid(valid);

    setOldPasswordConfirming(false);
  };

  const handleChangeClicked = async (newPassword: string) => {
    setChangeConfirmed(true);
    setNewPasswordBeingCreated(true);

    await Password.ChangePassword.perform(oldPassword, newPassword);

    setNewPasswordBeingCreated(false);
  };

  if (changeConfirmed) {
    return (
      <Success
        heading="Complete"
        subheading="Your password was successfully changed."
        buttonDisabled={newPasswordBeingCreated}
        onButtonClick={goHome}
      />
    );
  }

  if (oldPasswordValid) {
    return (
      <Flow title="Change Password" hideBackButton onClose={goHome}>
        <CreatePassword changing onPasswordConfirmed={handleChangeClicked} />
      </Flow>
    );
  }

  const oldPasswordInvalid = oldPasswordValid === false;

  return (
    <Flow title="Change Password" hideCloseButton onBack={goBack}>
      <FlowStep>
        <FlowStepHeader title="Confirm Your Password" pb={0} />
        <FlowStepBody>
          <Typography variant="body2" mb={3}>
            Before proceeding we need you to confirm your password.
          </Typography>
          <PasswordField
            label="Current Password"
            placeholder="Enter Password"
            visibilityControl
            value={oldPassword}
            onChange={handleOldPasswordConfirmChange}
            onClear={handleOldPasswordConfirmClear}
            error={oldPasswordInvalid}
          />
          <ErrorText mt={1.5} error={oldPasswordInvalid ? "Invalid password. Try again" : null} />
        </FlowStepBody>
        <FlowStepActions>
          <Button
            variant="contained"
            disabled={!oldPassword || oldPasswordConfirming || oldPasswordInvalid}
            onClick={handleOldPasswordConfirmClick}
          >
            Confirm
          </Button>
        </FlowStepActions>
      </FlowStep>
    </Flow>
  );
});
