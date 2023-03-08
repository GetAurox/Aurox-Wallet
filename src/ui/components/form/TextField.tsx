import { useCallback, MouseEvent } from "react";
import clsx from "clsx";

import makeStyles from "@mui/styles/makeStyles";

import { IconButton } from "@mui/material";

import { IconClear } from "ui/components/icons";

import FormField, { FormFieldProps } from "./FormField";

const useStyles = makeStyles(() => ({
  control: {
    "&.MuiButtonBase-root": {
      padding: 0,
    },
  },
  resetControl: {
    "&.MuiButtonBase-root": {
      marginRight: 12,
    },
  },
}));

export interface TextFieldProps extends FormFieldProps {
  onClear?: () => void;
}

export default function TextField(props: TextFieldProps) {
  const { value, onChange, onClear, ...rest } = props;

  const classes = useStyles();

  const handleMouseDownResetValue = useCallback((event: MouseEvent<HTMLButtonElement>) => event.preventDefault(), []);

  const canClear = !!onClear && !!value;

  return (
    <FormField
      type="text"
      value={value}
      onChange={onChange}
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
        </>
      }
      {...rest}
    />
  );
}
