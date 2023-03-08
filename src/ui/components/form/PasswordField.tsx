import { useState, useCallback, MouseEvent } from "react";
import clsx from "clsx";

import makeStyles from "@mui/styles/makeStyles";
import { IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";

import { useKeyLock } from "ui/hooks/utils";

import { IconInfo, IconClear, IconVisibilityOn, IconVisibilityOff } from "ui/components/icons";

import FormField, { FormFieldProps } from "./FormField";

const useStyles = makeStyles(() => ({
  control: {
    "&.MuiButtonBase-root": {
      padding: 0,
    },
  },
  visibilityControl: {
    "&.MuiButtonBase-root": {
      marginRight: 12,
    },
  },
  resetControl: {
    "&.MuiButtonBase-root": {
      marginRight: 12,

      "&+$visibilityControl": {
        marginLeft: -4,
      },
    },
  },
}));

export interface PasswordFieldProps extends FormFieldProps {
  onClear?: () => void;
  visibilityControl?: boolean;
  defaultShowPassword?: boolean;
}

export default function PasswordField(props: PasswordFieldProps) {
  const { value, onChange, onClear, visibilityControl, defaultShowPassword, ...rest } = props;

  const classes = useStyles();

  const [showPassword, setShowPassword] = useState(defaultShowPassword ?? false);

  const theme = useTheme();
  const [isCapsLockOn, onKeyUp] = useKeyLock("CapsLock");

  const handleToggleShowPassword = useCallback(() => setShowPassword(value => !value), []);

  const handleMouseDownShowPassword = useCallback((event: MouseEvent<HTMLButtonElement>) => event.preventDefault(), []);
  const handleMouseDownResetValue = useCallback((event: MouseEvent<HTMLButtonElement>) => event.preventDefault(), []);

  const canClear = !!onClear && !!value;

  return (
    <Tooltip
      arrow
      PopperProps={{ disablePortal: true }}
      placement="top-start"
      open={isCapsLockOn}
      title={
        <Stack columnGap={0.5} direction="row">
          <IconInfo color={theme.palette.warning.main} />
          <Typography variant="medium" color={theme.palette.warning.main}>
            Warning: Your caps lock is on
          </Typography>
        </Stack>
      }
    >
      <FormField
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        onKeyUp={onKeyUp}
        end={
          <>
            {canClear && (
              <IconButton
                aria-label="Reset Value"
                onClick={onClear}
                onMouseDown={handleMouseDownResetValue}
                className={clsx(classes.control, classes.resetControl)}
                tabIndex={-1}
              >
                <IconClear />
              </IconButton>
            )}
            {visibilityControl && (
              <IconButton
                aria-label="Toggle Password Visibility"
                onClick={handleToggleShowPassword}
                onMouseDown={handleMouseDownShowPassword}
                className={clsx(classes.control, classes.visibilityControl)}
                tabIndex={-1}
              >
                {showPassword ? <IconVisibilityOff /> : <IconVisibilityOn />}
              </IconButton>
            )}
          </>
        }
        {...rest}
      />
    </Tooltip>
  );
}
