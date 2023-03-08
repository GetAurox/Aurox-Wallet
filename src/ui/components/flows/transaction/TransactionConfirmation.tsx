import { ChangeEvent, SyntheticEvent, useState } from "react";

import { Box, Theme } from "@mui/material";

import CheckboxField from "ui/components/form/CheckboxField";
import PasswordField from "ui/components/form/PasswordField";

import { mixSx } from "ui/common/utils";

const sxStyles = {
  checkboxField: {
    root: {
      "&.MuiFormControlLabel-root": {
        alignItems: "flex-start",
        marginTop: 3.5,
      },
    },
    errorCheckbox: {
      "span svg rect": {
        stroke: (theme: Theme) => theme.palette.custom.red["60"],
      },
    },
    errorLabel: {
      color: (theme: Theme) => theme.palette.custom.red["60"],
    },
  },
};

export interface TransactionConfirmationProps {
  onPassword: (value: string) => void;
  onCheckbox: (value: boolean) => void;
  validPassword: boolean;
  validCheckbox: boolean;
  touched: boolean;
}

export function TransactionConfirmation(props: TransactionConfirmationProps) {
  const { onPassword, onCheckbox, validPassword, validCheckbox, touched } = props;

  const [password, setPassword] = useState("");
  const [checkbox, setCheckbox] = useState(false);

  const handleOnChangePassword = (event: ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;

    setPassword(password);

    if (checkbox) {
      onPassword(password);
    }
  };

  const handleOnChangeCheckbox = (event: SyntheticEvent, checked: boolean) => {
    setCheckbox(checked);
    onCheckbox(checked);

    if (password !== "") {
      onPassword(password);
    }
  };

  const checkboxError = !validCheckbox && touched;
  const passwordError = !validPassword && touched;

  return (
    <>
      <CheckboxField
        label="I understand I'm transacting with a potential scam/hack contract and I take full responsibility for my actions."
        value={checkbox}
        sx={{
          root: mixSx(sxStyles.checkboxField.root, checkboxError ? sxStyles.checkboxField.errorCheckbox : {}),
          label: checkboxError ? sxStyles.checkboxField.errorLabel : {},
        }}
        onChange={handleOnChangeCheckbox}
        checkboxProps={{ required: true, color: "error" }}
      />

      <Box mt="19px" mb="28px" justifyContent="space-between">
        <PasswordField
          label="Current Password"
          placeholder="Enter password"
          visibilityControl
          autoFocus
          value={password}
          onChange={handleOnChangePassword}
          autoComplete="off"
          helper="Enter your password to continue."
          error={passwordError}
        />
      </Box>
    </>
  );
}
