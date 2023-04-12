import { ChangeEvent, FocusEvent, forwardRef, ReactNode, Ref, useCallback, useMemo, useState } from "react";

import { Paper, paperClasses, InputBase, FormHelperText, SxProps, Stack, InputBaseProps, Theme, Typography } from "@mui/material";

import { mixSx } from "ui/common/utils";

const sxStyles = {
  root: {
    width: "100%",
  },
  label: {
    mb: "7px",
  },
  inputPaper: {
    display: "flex",
    alignItems: "center",

    [`&.${paperClasses.root}`]: {
      borderRadius: "12px",
      boxShadow: "none",
      backgroundImage: "none",
      backgroundColor: (theme: Theme) => theme.palette.custom.grey["19"],
      border: (theme: Theme) => `1px solid ${theme.palette.custom.grey["19"]}`,
    },

    "&:focus-within": {
      borderColor: "primary.main",
    },
  },
  inputPaperError: {
    [`&.${paperClasses.root}`]: {
      borderColor: "error.main",
    },

    "&:focus-within": {
      borderColor: "error.main",
    },
  },
  inputBase: {
    flex: 1,
  },
  helper: {
    mt: 1.5,
    color: "text.secondary",
    fontSize: 12,
    lineHeight: 16 / 12,
    letterSpacing: "0.4px",
  },
};

export interface FormFieldProps extends Omit<InputBaseProps, "sx" | "ref"> {
  start?: ReactNode;
  end?: ReactNode;
  label?: ReactNode;
  helper?: ReactNode;
  placeholder?: string;
  validator?: (value: string) => boolean;
  sx?: Partial<Record<keyof typeof sxStyles, SxProps<Theme>>>;
}

const FormField = forwardRef((props: FormFieldProps, ref: Ref<unknown>) => {
  const { onChange, onBlur, start, end, label, helper, error, sx = {}, validator, ...rest } = props;

  const [hasError, setHasError] = useState(false);

  const id = useMemo(() => Math.round(Math.random() * 1e6), []);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setHasError(false);

      onChange?.(event);
    },
    [onChange],
  );

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      if (validator && !validator(event.target.value)) {
        setHasError(true);
      }

      onBlur?.(event);
    },
    [validator, onBlur],
  );

  return (
    <Stack sx={mixSx(sxStyles.root, sx.root)}>
      {label && (
        <Typography
          variant="medium"
          component="label"
          htmlFor={`field_${id}`}
          sx={mixSx(sxStyles.label, sx.label)}
          color={error || hasError ? "error.main" : "text.primary"}
        >
          {label}
        </Typography>
      )}
      <Paper sx={mixSx(sxStyles.inputPaper, sx.inputPaper, error || hasError ? sxStyles.inputPaperError : undefined)}>
        {start}
        <InputBase
          {...rest}
          inputRef={ref}
          id={`field_${id}`}
          onBlur={handleBlur}
          onChange={handleChange}
          aria-describedby={`helper_${id}`}
          sx={mixSx(sxStyles.inputBase, sx.inputBase)}
        />
        {end}
      </Paper>
      {helper && (
        <FormHelperText id={`helper_${id}`} sx={mixSx(sxStyles.helper, sx.helper)}>
          {helper}
        </FormHelperText>
      )}
    </Stack>
  );
});

export default FormField;
