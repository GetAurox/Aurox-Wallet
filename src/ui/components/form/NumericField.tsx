import { NumericFormat, NumberFormatValues, SourceInfo } from "react-number-format";

import { Theme } from "@mui/material";

import { mixSx } from "ui/common/utils";

import TextField, { TextFieldProps } from "./TextField";

const sxStyles = {
  textField: {
    inputPaper: {
      border: 0,
      width: "100%",
      outline: "none",
      caretColor: "primary.main",
      justifyContent: "space-between",

      "&:focus-within": {
        outline: "1px solid",
        outlineColor: "primary.main",
      },

      "&.MuiPaper-root": {
        borderRadius: "12px",
        backgroundColor: (theme: Theme) => theme.palette.custom.grey["30"],
      },
    },
  },
};

export interface NumericFieldProps extends TextFieldProps {
  /** Decimals to show depending if input is crypto or fiat amount */
  decimals: number;
  /** Prevent onChange shadowing */
  onNumericInputChange: (input: string) => any;
}

export default function NumericField(props: NumericFieldProps) {
  const { autoFocus, decimals, value, placeholder, helper, label, onClear, onNumericInputChange, sx = {} } = props;

  const handleClear = () => {
    onClear && onClear();
  };

  const handleValueChange = (values: NumberFormatValues, event: SourceInfo) => {
    if (event.source === "prop") return;

    const { formattedValue } = values;

    onNumericInputChange(formattedValue);
  };

  return (
    <NumericFormat
      label={label}
      helper={helper}
      autoFocus={autoFocus}
      onClear={handleClear}
      allowNegative={false}
      value={value as string}
      customInput={TextField}
      decimalScale={decimals}
      thousandSeparator={decimals !== 0}
      placeholder={placeholder}
      onValueChange={handleValueChange}
      sx={{ ...sxStyles.textField, inputPaper: mixSx(sxStyles.textField.inputPaper, sx.inputPaper) }}
    />
  );
}
