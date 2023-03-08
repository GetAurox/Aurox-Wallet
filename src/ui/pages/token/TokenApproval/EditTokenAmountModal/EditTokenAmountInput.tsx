import { useCallback, useEffect, useState } from "react";

import { Box, Typography, Theme } from "@mui/material";

import NumericField from "ui/components/form/NumericField";

import { formatAmount, formatValueFromAmountAndPrice, unformattedAmount } from "ui/common/utils";

const sxStyles = {
  label: {
    mb: "5px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amount: {
    "& .MuiTypography-root": {
      fontSize: "14px",
      fontWeight: "normal",
      letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
      lineHeight: (theme: Theme) => theme.typography.pxToRem(20),
    },
  },
  balance: {
    "&.MuiTypography-root": {
      fontSize: "14px",
      letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
      lineHeight: (theme: Theme) => theme.typography.pxToRem(20),
      color: (theme: Theme) => theme.palette.text.secondary,
    },
  },
  numericField: {
    helper: {
      "&.MuiFormHelperText-root": {
        mt: "9px",
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: (theme: Theme) => theme.typography.pxToRem(20),
        letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
      },
    },
  },
};

export interface EditTokenAmountInputProps {
  symbol: string;
  balance: number;
  amount: number;
  decimals: number;
  price?: number;
  setBalance: (balance: number) => any;
}

export default function EditTokenAmountInput(props: EditTokenAmountInputProps) {
  const { symbol, amount, price, balance, decimals, setBalance } = props;

  const [inputValue, setInputValue] = useState("0");
  const [helperValue, setHelperValue] = useState<string | null>(null);

  useEffect(() => {
    const newAmount = unformattedAmount(inputValue);

    setBalance(newAmount);

    if (price) {
      const value = formatValueFromAmountAndPrice(newAmount, price, "~$");

      setHelperValue(value);
    }
  }, [inputValue, setBalance, amount, price]);

  useEffect(() => {
    if (amount) {
      setInputValue(formatAmount(amount));
    }
  }, [amount]);

  const clearForm = () => {
    setInputValue(formatAmount(balance));
  };

  const inputLabel = useCallback(() => {
    const totalBalance = price ? formatValueFromAmountAndPrice(balance, price, "$") : null;

    return (
      <Box sx={sxStyles.label}>
        <Typography sx={sxStyles.amount}>Amount {symbol}</Typography>
        {totalBalance && <Typography sx={sxStyles.balance}>Balance: {totalBalance}</Typography>}
      </Box>
    );
  }, [price, symbol, balance]);

  return (
    <Box>
      <NumericField
        decimals={decimals}
        value={inputValue}
        onClear={clearForm}
        label={inputLabel()}
        helper={helperValue}
        sx={sxStyles.numericField}
        onNumericInputChange={setInputValue}
        placeholder={formatAmount(amount)}
      />
    </Box>
  );
}
