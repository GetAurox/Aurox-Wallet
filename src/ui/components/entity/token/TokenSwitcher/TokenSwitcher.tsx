import { useState, useEffect, ChangeEvent, MouseEvent, useMemo, useRef } from "react";
import Decimal from "decimal.js";

import { Theme, Stack, ButtonProps, Divider, Typography, Button, buttonClasses } from "@mui/material";

import { DEFAULT_DECIMALS } from "common/config";

import { formatAmount } from "ui/common/utils";
import { USD_DECIMALS } from "ui/common/constants";

import { TokenDisplayWithTicker } from "ui/types";
import { IconSwitchValues, IconArrowDownIOS } from "ui/components/icons";

import TokenIdentity from "../TokenIdentity";

import TokenSwitcherSwitchValuesButton from "./TokenSwitcherSwitchValuesButton";
import TokenSwitcherSelectButton from "./TokenSwitcherSelectButton";
import TokenSwitcherSurface from "./TokenSwitcherSurface";
import TokenSwitcherInput from "./TokenSwitcherInput";

import {
  calculateMaxValue,
  calculateMinValue,
  calculateStepValue,
  countTrailingZeros,
  getFormattedBalance,
  getPrefix,
  getSuffix,
} from "./helpers";

const sxStyles = {
  divider: {
    ml: 1,
    mr: 1.5,
    borderColor: (theme: Theme) => theme.palette.custom.grey["30"],
  },
  balanceButton: {
    [`&.${buttonClasses.disabled}`]: {
      all: "unset",
      display: "inline",
    },
  },
};

export interface TokenSwitcherProps extends Omit<ButtonProps, "onChange" | "value"> {
  title: string;
  approx: boolean;
  disabled?: boolean;
  switchToUSD?: boolean;
  networkFeeUSD?: number;
  exceedsBalance?: boolean;
  cappedByBalance?: boolean;
  token?: TokenDisplayWithTicker | null;
  value: { amount: string; currency: string };
  onSwitchToUSD?: () => void;
  onBalanceClick?: (event: MouseEvent) => void;
  onChange?: (value: { amount: string; currency: string }) => void;
}

export default function TokenSwitcher(props: TokenSwitcherProps) {
  const {
    title,
    token,
    value,
    approx,
    disabled,
    onChange,
    onSwitchToUSD,
    networkFeeUSD,
    switchToUSD = false,
    exceedsBalance = false,
    cappedByBalance = false,
    ...rest
  } = props;

  const balanceClicked = useRef(false);
  const [helperText, setHelperText] = useState("--");

  const { priceUSD = "0", balance = "0", symbol, balanceUSDValue } = token ?? {};

  const priceDecimal = useMemo(() => new Decimal(priceUSD ?? 0), [priceUSD]);
  const balanceDecimal = useMemo(() => new Decimal(balance ?? 0), [balance]);
  const isValueInUSD = switchToUSD && priceDecimal.greaterThan(0);

  const normalizedCurrencyValue = value.currency || "0";
  const normalizedAmountValue = value.amount || "0";

  const currencyDecimalValue = useMemo(() => new Decimal(normalizedCurrencyValue), [normalizedCurrencyValue]);
  const amountDecimalValue = useMemo(() => new Decimal(normalizedAmountValue), [normalizedAmountValue]);

  const decimals = token?.decimals ?? DEFAULT_DECIMALS;

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!onChange) return;

    const minimalAllowedAmountDecimal = new Decimal(Math.pow(10, -decimals));

    const normalizedNewValue = event.target.value.trim();

    const trailingZeros = countTrailingZeros(normalizedNewValue);

    let newAmountDecimal = new Decimal(normalizedNewValue || 0);

    if (newAmountDecimal.greaterThan(0) && newAmountDecimal.lessThan(minimalAllowedAmountDecimal)) {
      newAmountDecimal = minimalAllowedAmountDecimal;
    }

    const newAmountValue = newAmountDecimal
      .div(isValueInUSD ? priceDecimal : 1)
      .toDP(decimals)
      .toFixed(trailingZeros > 0 ? trailingZeros : undefined);

    const newCurrencyValue = newAmountDecimal
      .times(!switchToUSD && priceDecimal.greaterThan(0) ? priceDecimal : 1)
      .toDP(USD_DECIMALS)
      .toFixed(trailingZeros > 0 ? trailingZeros : undefined);

    balanceClicked.current = false;

    onChange({ amount: newAmountValue, currency: newCurrencyValue });
  };

  const handleOnSwitchToUSD = () => {
    onSwitchToUSD?.();
  };

  const handleBalanceClick = (event: MouseEvent) => {
    event.preventDefault();

    if (!balance || !balanceUSDValue || !onChange) return;

    let balanceDecimalCurrency = new Decimal(balanceUSDValue);
    let balanceDecimalAmount = new Decimal(balance);

    const minimalAllowedAmountDecimal = new Decimal(Math.pow(10, -decimals));

    if (balanceDecimalAmount.greaterThan(0) && balanceDecimalAmount.lessThan(minimalAllowedAmountDecimal)) {
      balanceDecimalAmount = minimalAllowedAmountDecimal;
      balanceDecimalCurrency = balanceDecimalAmount.times(priceDecimal);
    }

    const amountValue = balanceDecimalAmount.toDP(decimals).toFixed();
    const currencyValue = balanceDecimalCurrency.toDP(USD_DECIMALS).toFixed();

    balanceClicked.current = true;

    onChange({ amount: amountValue, currency: currencyValue });
  };

  useEffect(() => {
    if (priceDecimal.eq(0) || amountDecimalValue.eq(0)) {
      setHelperText("--");

      return;
    }

    const prefix = approx ? "~" : "";

    const amount = isValueInUSD
      ? formatAmount(currencyDecimalValue.div(priceDecimal).toNumber())
      : `$${formatAmount(amountDecimalValue.times(priceDecimal).toNumber())}`;

    const suffix = isValueInUSD && symbol ? symbol : "";

    setHelperText(`${prefix} ${amount} ${suffix}`);
  }, [isValueInUSD, approx, symbol, priceDecimal, amountDecimalValue, currencyDecimalValue]);

  useEffect(() => {
    const isAmount100Percent = amountDecimalValue.eq(balanceDecimal);
    const balanceUSDValue = new Decimal(token?.balanceUSDValue ?? 0).toNumber();

    const shouldDeductNetworkFee =
      !!networkFeeUSD && isAmount100Percent && token?.assetDefinition.type === "native" && balanceUSDValue > networkFeeUSD;

    if (shouldDeductNetworkFee && token?.priceUSD && Number(token.priceUSD) > 0 && onChange) {
      const feeAmount = new Decimal(networkFeeUSD).div(new Decimal(token.priceUSD));

      const deductedFeeDecimal = amountDecimalValue.minus(feeAmount);

      onChange({
        amount: deductedFeeDecimal.toDP(token.decimals).toFixed(),
        currency: deductedFeeDecimal.times(token.priceUSD).toFixed(USD_DECIMALS),
      });
    }
  }, [token, networkFeeUSD, onChange, amountDecimalValue, balanceDecimal]);

  useEffect(() => {
    if (!networkFeeUSD || !token?.priceUSD || !Number(token?.priceUSD)) return;

    const feeAmount = new Decimal(networkFeeUSD).div(new Decimal(token.priceUSD));

    const decimalAmountWithFee = amountDecimalValue.add(feeAmount).toDP(decimals);

    const balanceUSDValue = new Decimal(token?.balanceUSDValue ?? 0).toNumber();

    const isAmountWithFeeOver100Percent = token?.balance && decimalAmountWithFee.toNumber() > Number(token.balance);

    const shouldDeductNetworkFee =
      balanceClicked.current &&
      isAmountWithFeeOver100Percent &&
      token?.assetDefinition.type === "native" &&
      balanceUSDValue > networkFeeUSD;

    if (shouldDeductNetworkFee && onChange) {
      const remainder = decimalAmountWithFee.minus(balanceDecimal).toDP(decimals);

      if (remainder.isPositive()) {
        const deductedFeeDecimal = amountDecimalValue.minus(remainder);

        onChange({
          amount: deductedFeeDecimal.toDP(decimals).toFixed(),
          currency: deductedFeeDecimal.times(token.priceUSD).toDP(USD_DECIMALS).toFixed(),
        });
      }
    }
  }, [token, networkFeeUSD, onChange, amountDecimalValue, decimals, balanceDecimal]);

  const prefix = getPrefix(switchToUSD, approx);
  const suffix = getSuffix(switchToUSD, symbol);
  const min = calculateMinValue(switchToUSD, decimals);
  const step = calculateStepValue(switchToUSD, decimals);
  const max = calculateMaxValue(switchToUSD, cappedByBalance, priceUSD, balance);
  const formattedBalance = getFormattedBalance(switchToUSD, priceUSD, balance);
  const switcherInputDisabled = disabled || min === null || max === null || step === null;

  return (
    <>
      <Stack mb="7px" direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="medium">{title}</Typography>
        <Typography component="div" variant="medium" color="text.secondary">
          Balance:{" "}
          <Button sx={sxStyles.balanceButton} disabled={disabled || !balance} onClick={handleBalanceClick} color="primary">
            {formattedBalance}
          </Button>
        </Typography>
      </Stack>
      <TokenSwitcherSurface>
        <Stack direction="row" alignItems="center" justifyContent="flex-start">
          <TokenSwitcherSelectButton
            disableRipple
            variant="text"
            color="inherit"
            disabled={disabled}
            endIcon={disabled ? undefined : <IconArrowDownIOS />}
            {...rest}
          >
            {token ? (
              <TokenIdentity {...token.img} networkIdentifier={token.networkIdentifier} spacing={1} primary={token.symbol} />
            ) : (
              <Typography variant="medium" lineHeight="24px">
                Select a token
              </Typography>
            )}
          </TokenSwitcherSelectButton>
          <Divider flexItem orientation="vertical" sx={sxStyles.divider} />
          <Stack maxWidth={194} flexGrow={1} mr={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography component="span" mr={0.5}>
                {prefix}
              </Typography>

              <TokenSwitcherInput
                type="number"
                placeholder="0"
                onChange={handleOnChange}
                inputProps={{ min, max, step }}
                disabled={switcherInputDisabled}
                value={isValueInUSD ? value.currency : value.amount}
              />
              <Typography component="span">{suffix}</Typography>
            </Stack>

            <Typography noWrap variant="medium" mt={0.5} color="text.secondary">
              {helperText}
            </Typography>
          </Stack>
          {!disabled && (
            <TokenSwitcherSwitchValuesButton disableRipple variant="text" onClick={handleOnSwitchToUSD}>
              <IconSwitchValues />
            </TokenSwitcherSwitchValuesButton>
          )}
        </Stack>
      </TokenSwitcherSurface>
      {
        <Typography
          mt="7px"
          variant="small"
          color="error.main"
          aria-hidden={!(exceedsBalance && balance)}
          visibility={exceedsBalance && balance ? "visible" : "hidden"}
        >
          Amount must not exceed balance ({formatAmount(balance ?? 0)}
          {!switchToUSD && ` ${symbol}`})
        </Typography>
      }
    </>
  );
}
