import { useState, useCallback, MouseEvent, ChangeEvent, KeyboardEvent, ReactNode } from "react";
import clsx from "clsx";

import { useTheme } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

import { IconButton } from "@mui/material";

import { IconClear, IconSearch } from "ui/components/icons";

import FormField, { FormFieldProps } from "./FormField";

const useStyles = makeStyles(() => ({
  control: {
    "&.MuiButtonBase-root": {
      padding: 0,
    },
  },
  searchControl: {
    "&.MuiButtonBase-root": {
      marginLeft: 12,
    },
  },
  resetControl: {
    "&.MuiButtonBase-root": {
      marginRight: 12,
    },
  },
  endControl: {
    "&.MuiButtonBase-root": {
      marginRight: 12,
    },
  },
}));

export interface SearchFieldProps extends FormFieldProps {
  onClear?: () => void;
  onSearch?: () => void;
  resetControl?: boolean;
  controlClassName?: string;
  endIcon?: ReactNode;
  onClickEndIcon?: () => void;
}

export default function SearchField(props: SearchFieldProps) {
  const {
    value: parentValue,
    onChange: parentOnChange,
    onSearch: parentOnSearch,
    onClear: parentOnClear,
    resetControl,
    controlClassName,
    endIcon,
    onClickEndIcon,
    ...rest
  } = props;

  const classes = useStyles();

  const theme = useTheme();

  const [canReset, setCanReset] = useState(!!parentValue);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;

    if (value) {
      setCanReset(true);
    } else {
      setCanReset(false);
    }

    parentOnChange && parentOnChange(event);
  };

  const handleClickResetValue = useCallback(() => {
    setCanReset(false);

    parentOnClear && parentOnClear();
  }, [parentOnClear]);

  const handleMouseDownResetValue = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        parentOnSearch && parentOnSearch();
      }
    },
    [parentOnSearch],
  );

  const handleClickSearch = useCallback(() => {
    parentOnSearch && parentOnSearch();
  }, [parentOnSearch]);

  const handleMouseDownSearch = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleClickEndIcon = () => {
    onClickEndIcon?.();
  };

  return (
    <FormField
      type="text"
      value={parentValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      start={
        <IconButton
          aria-label="Search"
          onClick={handleClickSearch}
          onMouseDown={handleMouseDownSearch}
          className={clsx(classes.control, controlClassName, classes.searchControl)}
        >
          <IconSearch color={theme.palette.text.secondary} />
        </IconButton>
      }
      end={
        <>
          {resetControl && canReset && (
            <IconButton
              aria-label="Reset value"
              onClick={handleClickResetValue}
              onMouseDown={handleMouseDownResetValue}
              className={clsx(classes.control, controlClassName, classes.resetControl)}
            >
              <IconClear />
            </IconButton>
          )}

          {endIcon && (
            <IconButton className={clsx(classes.control, classes.endControl)} onClick={handleClickEndIcon}>
              {endIcon}
            </IconButton>
          )}
        </>
      }
      {...rest}
    />
  );
}
