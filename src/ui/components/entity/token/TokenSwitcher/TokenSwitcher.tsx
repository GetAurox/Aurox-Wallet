import { useState, useEffect, ChangeEvent } from "react";
import { NumericFormat } from "react-number-format";

import { Theme, Stack, ButtonProps, Divider, Typography } from "@mui/material";

import { formatAmount } from "ui/common/utils";

import { IconSwitchValues, IconArrowDownIOS } from "ui/components/icons";

import TokenSwitcherSwitchValuesButton from "./TokenSwitcherSwitchValuesButton";
import TokenSwitcherSelectButton from "./TokenSwitcherSelectButton";
import TokenSwitcherSurface from "./TokenSwitcherSurface";
import TokenSwitcherInput from "./TokenSwitcherInput";

export interface TokenSwitcherProps extends Omit<ButtonProps, "onChange"> {
  approx: boolean;
  amount: number;
  price: number;
  balance: number;
  onChange: (value: number) => void;
  error?: boolean;
}

export default function TokenSwitcher(props: TokenSwitcherProps) {
  const { approx, amount, price, balance, onChange, disabled, error, ...rest } = props;

  const [switchValues, setSwitchValues] = useState(true);
  const [value, setValue] = useState<number | undefined>();
  const [helperText, setHelperText] = useState("");

  const handleSwitchValues = () => setSwitchValues(old => !old);

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsedValue = Number.parseFloat(event.target.value.replace(/[^0-9.]/g, ""));
    const newValue = Number.isNaN(parsedValue) ? 0 : parsedValue;

    if (switchValues) {
      onChange(price ? newValue / price : 0);
    } else {
      onChange(newValue);
    }
  };

  useEffect(() => {
    if (switchValues) {
      setHelperText(formatAmount(price ? (value ?? 0) / price : 0));
    } else {
      setHelperText(`$${formatAmount((value ?? 0) * price)}`);
    }
  }, [switchValues, price, value]);

  useEffect(() => {
    if (switchValues) {
      setValue(amount * price);
    } else {
      setValue(amount);
    }
  }, [switchValues, price, amount]);

  let prefix = undefined;

  if (switchValues) {
    prefix = "$";

    if (approx) {
      prefix = "~" + prefix;
    }
  } else {
    if (approx) {
      prefix = "~";
    }
  }

  return (
    <TokenSwitcherSurface>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <TokenSwitcherSelectButton
          disableRipple
          variant="text"
          color="inherit"
          disabled={disabled}
          endIcon={disabled ? undefined : <IconArrowDownIOS />}
          {...rest}
        />
        <Divider orientation="vertical" flexItem sx={{ ml: 1, mr: 1.5, borderColor: (theme: Theme) => theme.palette.custom.grey["30"] }} />
        <Stack>
          <NumericFormat
            prefix={prefix}
            thousandSeparator
            value={value}
            onChange={handleOnChange}
            customInput={TokenSwitcherInput}
            allowNegative={false}
            error={error}
            disabled={disabled}
            decimalScale={switchValues ? 2 : 6}
          />
          <Typography variant="small" color={error ? "error.main" : "text.secondary"}>
            {helperText}
          </Typography>
        </Stack>
        {!disabled && (
          <TokenSwitcherSwitchValuesButton disableRipple variant="text" onClick={handleSwitchValues}>
            <IconSwitchValues />
          </TokenSwitcherSwitchValuesButton>
        )}
      </Stack>
    </TokenSwitcherSurface>
  );
}
