import { useState, useEffect, ChangeEvent, useCallback } from "react";
import Decimal from "decimal.js";

import { Stack, Box, Typography } from "@mui/material";

import { formatAmount } from "ui/common/utils";

import { IconSwitchValues } from "ui/components/icons";

import TokenAmountSelectorDiscretePercentage from "./TokenAmountSelectorDiscretePercentage";
import TokenAmountSelectorSwitchValuesButton from "./TokenAmountSelectorSwitchValuesButton";
import TokenAmountSelectorCustomPercentage from "./TokenAmountSelectorCustomPercentage";
import TokenAmountSelectorSurface from "./TokenAmountSelectorSurface";
import TokenAmountSelectorInput from "./TokenAmountSelectorInput";

const discretePercentages = [25, 50, 75, 100];
const USD_DECIMALS = 2;
const MIN_AMOUNT_IN_USD = Math.pow(10, -USD_DECIMALS);

export interface TokenAmountSelectorProps {
  currency: string;
  decimals: number;
  amount: string;
  balance: string;
  price: string;
  feePrice: number;
  onChange: (value: string) => void;
  error?: boolean;
  errorText?: string;
  selectedTokenType: "native" | "contract";
}

export default function TokenAmountSelector(props: TokenAmountSelectorProps) {
  const { currency, decimals, amount, balance, price, onChange, error, errorText, feePrice, selectedTokenType } = props;

  const normalizedAmount = !amount.trim() ? "0" : amount;

  const [switchValues, setSwitchValues] = useState(new Decimal(price).greaterThan(0)); // Defaulting values to $ if price is non-zero
  const [value, setValue] = useState(() => {
    if (switchValues) {
      if (!String(amount).trim()) {
        return "";
      }

      return new Decimal(normalizedAmount).times(new Decimal(price)).toDP(USD_DECIMALS).toFixed();
    }

    return amount;
  });
  const [percentage, setPercentage] = useState<number | { custom: number }>(0);
  const [helperText, setHelperText] = useState("");

  const handleSwitchValues = useCallback(() => {
    const newSwitchValues = !switchValues;
    const priceDecimal = new Decimal(price);
    let newValueDecimal = new Decimal(normalizedAmount);
    const displayValueInUSD = newSwitchValues && priceDecimal.greaterThan(0);

    if (displayValueInUSD) {
      newValueDecimal = newValueDecimal.times(priceDecimal);
    }

    setSwitchValues(newSwitchValues);
    setValue(newValueDecimal.toDP(displayValueInUSD ? USD_DECIMALS : decimals).toFixed());
  }, [switchValues, price, normalizedAmount, decimals]);

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const normalizedValue = !event.target.value.trim() ? "0" : event.target.value;
      let newAmountDecimal = new Decimal(normalizedValue);
      const balanceDecimal = new Decimal(balance);
      const priceDecimal = new Decimal(price);
      const minimalAllowedAmountDecimal = new Decimal(Math.pow(10, -decimals));
      const displayValueInUSD = switchValues && priceDecimal.greaterThan(0);

      setValue(event.target.value);

      if (newAmountDecimal.greaterThan(0) && displayValueInUSD && newAmountDecimal.decimalPlaces() > USD_DECIMALS) {
        setValue(newAmountDecimal.toDP(USD_DECIMALS).toFixed());
      } else if (!displayValueInUSD && newAmountDecimal.decimalPlaces() > decimals) {
        setValue(newAmountDecimal.toDP(decimals).toFixed());
      }

      if (displayValueInUSD) {
        newAmountDecimal = newAmountDecimal.div(priceDecimal);
      }

      if (newAmountDecimal.greaterThan(0) && newAmountDecimal.lessThan(minimalAllowedAmountDecimal)) {
        newAmountDecimal = minimalAllowedAmountDecimal;

        if (displayValueInUSD) {
          setValue(newAmountDecimal.times(priceDecimal).toDP(USD_DECIMALS).toFixed());
        } else {
          setValue(newAmountDecimal.toDP(decimals).toFixed());
        }
      }

      const newPercentageDecimal = newAmountDecimal.div(balanceDecimal).times(100);

      setPercentage({ custom: newPercentageDecimal.toNumber() });

      onChange(newAmountDecimal.toDP(decimals).toFixed());
    },
    [decimals, switchValues, price, balance, onChange],
  );

  const createSelectDiscretePercentageHandle = useCallback(
    (newPercentage: typeof percentage) => () => {
      setPercentage(newPercentage);

      const newPercentageDecimal = new Decimal(typeof newPercentage === "number" ? newPercentage : newPercentage.custom);
      const balanceDecimal = new Decimal(balance);
      const priceDecimal = new Decimal(price);
      const minimalAllowedAmountDecimal = new Decimal(Math.pow(10, -decimals));
      let newAmountDecimal = balanceDecimal.times(newPercentageDecimal).div(100);

      if (newAmountDecimal.greaterThan(0) && newAmountDecimal.lessThan(minimalAllowedAmountDecimal)) {
        newAmountDecimal = minimalAllowedAmountDecimal;
      }

      let newValueDecimal = newAmountDecimal;
      const displayValueInUSD = switchValues && priceDecimal.greaterThan(0);

      if (displayValueInUSD) {
        newValueDecimal = newValueDecimal.times(priceDecimal);

        setValue(newValueDecimal.toDP(USD_DECIMALS).toFixed());
      } else {
        setValue(newValueDecimal.toDP(decimals).toFixed());
      }

      onChange(newAmountDecimal.toDP(decimals).toFixed());
    },
    [decimals, balance, switchValues, price, onChange],
  );

  const handleCustomPercentageChange = useCallback(
    (event: Event, newCustomPercentage: number | number[]) => {
      setPercentage({ custom: newCustomPercentage as number });

      const newCustomPercentageDecimal = new Decimal(newCustomPercentage as number);
      const balanceDecimal = new Decimal(balance);
      const priceDecimal = new Decimal(price);
      const minimalAllowedAmountDecimal = new Decimal(Math.pow(10, -decimals));
      let newAmountDecimal = balanceDecimal.times(newCustomPercentageDecimal).div(100);

      if (newAmountDecimal.greaterThan(0) && newAmountDecimal.lessThan(minimalAllowedAmountDecimal)) {
        newAmountDecimal = minimalAllowedAmountDecimal;
      }

      let newValueDecimal = newAmountDecimal;
      const displayValueInUSD = switchValues && priceDecimal.greaterThan(0);

      if (displayValueInUSD) {
        newValueDecimal = newValueDecimal.times(priceDecimal);

        setValue(newValueDecimal.toDP(USD_DECIMALS).toFixed());
      } else {
        setValue(newValueDecimal.toDP(decimals).toFixed());
      }

      onChange(newAmountDecimal.toDP(decimals).toFixed());
    },
    [decimals, balance, switchValues, price, onChange],
  );

  useEffect(() => {
    const shouldDeductFee =
      selectedTokenType === "native" && (typeof percentage === "number" ? percentage === 100 : percentage.custom === 100);

    if (!isNaN(feePrice) && shouldDeductFee && feePrice > 0 && Number(price) > 0) {
      const balanceDecimal = new Decimal(balance);
      const priceDecimal = new Decimal(price);
      const feePriceDecimal = new Decimal(feePrice);
      const displayValueInUSD = switchValues && priceDecimal.greaterThan(0);

      const newAmountDecimal = balanceDecimal.minus(feePriceDecimal.div(priceDecimal).toDP(decimals));

      let newValueDecimal = newAmountDecimal;

      if (displayValueInUSD) {
        newValueDecimal = newValueDecimal.times(priceDecimal);

        setValue(newValueDecimal.toDP(USD_DECIMALS).toFixed());
      } else {
        setValue(newValueDecimal.toDP(decimals).toFixed());
      }

      onChange(newAmountDecimal.toDP(decimals).toFixed());
    }
  }, [amount, balance, decimals, feePrice, onChange, percentage, price, selectedTokenType, switchValues]);

  useEffect(() => {
    if (error) {
      setHelperText(errorText ?? "Unknown error");

      return;
    }

    const priceDecimal = new Decimal(price);

    if (priceDecimal.eq(0)) {
      setHelperText("");

      return;
    }

    const normalizedValue = !value ? "0" : value;
    const valueDecimal = new Decimal(normalizedValue);

    if (switchValues) {
      setHelperText(`${formatAmount(valueDecimal.div(price).toNumber())} ${currency}`);
    } else {
      setHelperText(`$${formatAmount(valueDecimal.times(price).toNumber())}`);
    }
  }, [error, errorText, switchValues, currency, price, value]);

  let prefix: string | undefined = undefined;
  let suffix: string | undefined = currency;

  if (switchValues) {
    prefix = "$";
    suffix = undefined;
  }

  const min = switchValues ? MIN_AMOUNT_IN_USD : Math.pow(10, -decimals);
  const max = switchValues ? new Decimal(balance).times(new Decimal(price)).toNumber() : balance;
  const step = switchValues ? MIN_AMOUNT_IN_USD : Math.pow(10, -decimals);

  return (
    <>
      <TokenAmountSelectorSurface>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {prefix && (
            <Box component="span" mr={0.5}>
              {prefix}
            </Box>
          )}
          <TokenAmountSelectorInput type="number" inputProps={{ min, max, step }} value={value} onChange={handleOnChange} error={error} />
          {suffix && (
            <Box component="span" ml={0.5}>
              {suffix}
            </Box>
          )}
          {!error && new Decimal(price).greaterThan(0) && (
            <TokenAmountSelectorSwitchValuesButton disableRipple variant="text" onClick={handleSwitchValues}>
              <IconSwitchValues />
            </TokenAmountSelectorSwitchValuesButton>
          )}
        </Stack>
      </TokenAmountSelectorSurface>
      {helperText && (
        <Typography variant="medium" mt="9px" color={error ? "error.main" : "text.secondary"}>
          {helperText}
        </Typography>
      )}
      <Stack mt="23px" direction="row" justifyContent="space-between" spacing="3px">
        {discretePercentages.map(discretePercentage => (
          <TokenAmountSelectorDiscretePercentage
            key={discretePercentage}
            size="small"
            color="inherit"
            variant={percentage === discretePercentage ? "contained" : "text"}
            onClick={createSelectDiscretePercentageHandle(discretePercentage)}
          >
            {discretePercentage}%
          </TokenAmountSelectorDiscretePercentage>
        ))}
        <TokenAmountSelectorDiscretePercentage
          size="small"
          color="inherit"
          variant={typeof percentage !== "number" ? "contained" : "text"}
          onClick={createSelectDiscretePercentageHandle({ custom: 0 })}
        >
          Custom
        </TokenAmountSelectorDiscretePercentage>
      </Stack>
      {typeof percentage !== "number" && (
        <TokenAmountSelectorCustomPercentage
          disableSwap
          sx={{ mt: 3 }}
          size="small"
          value={percentage.custom}
          onChange={handleCustomPercentageChange}
          min={0}
          max={100}
        />
      )}
    </>
  );
}
