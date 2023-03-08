import { useToggle } from "react-use";

import { IconButton, InputAdornment, InputProps, Stack, styled, Tooltip, Typography, useTheme } from "@mui/material";

import { useKeyLock } from "ui/hooks/utils";

import { IconInfo } from "ui/components/icons";

import { Icon } from "./Icon";
import { TextField } from "./TextField";

const Button = styled(IconButton)(({ theme }) => ({
  color: `${theme.palette.secondary.main} !important`,
}));

export function PasswordField(props: InputProps) {
  const [showPassword, toggleShowPassword] = useToggle(false);

  const theme = useTheme();
  const [isCapsLockOn, onKeyUp] = useKeyLock("CapsLock");

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
      <TextField
        onKeyUp={onKeyUp}
        endAdornment={
          <InputAdornment position="end">
            <Button tabIndex={-1} aria-label="toggle password visibility" color="secondary" edge="end" onClick={toggleShowPassword}>
              <Icon name={showPassword ? "24px-visibility-on" : "24px-visibility-off"} />
            </Button>
          </InputAdornment>
        }
        type={showPassword ? "text" : "password"}
        {...props}
      />
    </Tooltip>
  );
}
