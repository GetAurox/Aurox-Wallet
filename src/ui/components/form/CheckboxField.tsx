import { Theme } from "@mui/material/styles";

import { FormControlLabel, FormControlLabelProps, SxProps } from "@mui/material";

import Checkbox, { CheckboxProps } from "ui/components/common/Checkbox";
import { mixSx } from "ui/common/utils";

const sxStyles = {
  root: {
    "&.MuiFormControlLabel-root": {
      marginLeft: 0,
      marginRight: 0,
    },
  },
  label: {
    "&.MuiTypography-root": {
      paddingLeft: 8,
      fontSize: 14,
      lineHeight: 20 / 14,
      letterSpacing: "0.25px",
      color: "text.primary",
    },
  },
  checkbox: {
    "&.MuiButtonBase-root": {
      padding: 0,
      paddingRight: 1,
    },
  },
};

export interface CheckboxFieldProps extends Omit<FormControlLabelProps, "control" | "sx"> {
  checkboxProps?: Omit<CheckboxProps, "sx">;
  sx?: Partial<Record<keyof typeof sxStyles, SxProps<Theme>>>;
}

export default function CheckboxField(props: CheckboxFieldProps) {
  const { value, checkboxProps, sx, ...rest } = props;

  return (
    <FormControlLabel
      sx={mixSx(sxStyles.root, sx?.root, sxStyles.label, sx?.label)}
      control={<Checkbox sx={mixSx(sxStyles.checkbox, sx?.checkbox)} {...checkboxProps} />}
      {...rest}
    />
  );
}
