import Decimal from "decimal.js";

import { formatAmount } from "ui/common/utils";
import { USD_DECIMALS } from "ui/common/constants";

const MIN_AMOUNT_IN_USD = Math.pow(10, -USD_DECIMALS);

/**
 * Calculates the minimum value that can be entered in the amount input field
 * depending on whether the user has switched between USD and the asset
 * amount. If the user has switched to USD, the minimum value is `MIN_AMOUNT_IN_USD = 0.01`.
 *
 * @param switchValues - A boolean value that determines whether to use the constant
 * `MIN_AMOUNT_IN_USD` or calculate the minimum value using the `decimals` parameter.
 * @param decimals - An optional number representing the number of decimal places to be
 * considered when calculating the minimum value.
 * @returns A number or null based on the provided parameters:
 *   - If `decimals` is not provided, the function returns `null`.
 *   - If `switchValues` is `true`, the function returns the `MIN_AMOUNT_IN_USD`.
 *   - If `switchValues` is `false`, the function calculates the minimum value by raising 10
 *     to the power of the negative `decimals` value and returns the result.
 * @example
 * ```typescript
 * import { calculateMinValue } from './your-module';
 *
 * const switchValues = false;
 * const decimals = 16;
 *
 * const minValue = calculateMinValue(switchValues, decimals);
 * console.log(minValue); // Outputs the value of 0.0000000000000001 if switchValues is false
 * ```
 */
export const calculateMinValue = (switchValues: boolean, decimals?: number) => {
  if (!decimals) return null;

  return switchValues ? MIN_AMOUNT_IN_USD : Math.pow(10, -decimals);
};

/**
 * Calculates the maximum value that can be entered in the amount input field
 * depending on whether the user has switched between USD and the asset amount.
 * @param switchValues - A boolean value that determines whether the balance should be considered
 * in USD or as asset amount.
 * @param cappedByBalance - A boolean value that determines whether the maximum value should be
 * capped by the balance or set to `Infinity`.
 * @param priceUSD - A string representing the price of the asset in USD, or `null`
 * if the price is not available.
 * @param balance - An optional string representing the balance of the asset.
 * @returns A number, `Infinity`, or null based on the provided parameters:
 *   - If `balance` is not provided, the function returns `null`.
 *   - If `cappedByBalance` is `false`, the function returns `Infinity`.
 *   - If `switchValues` is `true`, the function calculates the maximum value by multiplying
 *     the balance with the price in USD and returns the result as a number.
 *   - If `switchValues` is `false`, the function returns the balance as a number.
 * @example
 * ```typescript
 * import { calculateMaxValue } from './your-module';
 *
 * const switchValues = true;
 * const cappedByBalance = true;
 * const priceUSD = '1.2';
 * const balance = '100';
 *
 * const maxValue = calculateMaxValue(switchValues, cappedByBalance, priceUSD, balance);
 * console.log(maxValue); // Outputs the calculated maximum value based on the input parameters
 * ```
 */
export const calculateMaxValue = (switchValues: boolean, cappedByBalance: boolean, priceUSD: string | null, balance?: string) => {
  if (!balance) return null;

  if (!cappedByBalance) return Infinity;

  return switchValues ? new Decimal(balance).times(new Decimal(priceUSD ?? 0)).toNumber() : balance;
};

/**
 * Calculates the step value for the amount input field based on the given parameters `switchValues` and `decimals`.
 * The step value can either be `MIN_AMOUNT_IN_USD = 0.01` or a value derived from a mathematical formula.
 *
 * @param switchValues - A boolean value that determines whether to use the constant
 * `MIN_AMOUNT_IN_USD` or calculate the step value using the `decimals` parameter.
 * @param decimals - An optional number representing the number of decimal places to be
 * considered when calculating the step value.
 * @returns A number or null based on the provided parameters:
 *   - If `decimals` is not provided, the function returns `null`.
 *   - If `switchValues` is `true`, the function returns the constant `MIN_AMOUNT_IN_USD`.
 *   - If `switchValues` is `false`, the function calculates the step value by raising 10
 *     to the power of the negative `decimals` value and returns the result.
 * @example
 * ```typescript
 * import { calculateStepValue } from './your-module';
 *
 * const switchValues = true;
 * const decimals = 2;
 *
 * const stepValue = calculateStepValue(switchValues, decimals);
 * console.log(stepValue); // Outputs the value of MIN_AMOUNT_IN_USD if switchValues is true
 * ```
 */
export const calculateStepValue = (switchValues: boolean, decimals?: number) => {
  if (!decimals) return null;

  return switchValues ? MIN_AMOUNT_IN_USD : Math.pow(10, -decimals);
};

/**
 * Calculates the formatted balance amount based on the given parameters `switchValues`, `balance`, and `priceUSD`.
 * The balance amount can either be displayed as amount or converted to USD.
 *
 * @param switchValues - A boolean value that determines whether to display the balance amount
 * in USD or not.
 * @param balance - A string representing the balance of the asset.
 * @param priceUSD - A string representing the price of the asset in USD, or `null`
 * if the price is not available.
 * @returns A string representing the formatted balance amount based on the provided parameters:
 *   - If `switchValues` is `true`, the function calculates the balance amount in USD by multiplying
 *     the balance with the price in USD, formats it to the specified number of decimal places (`USD_DECIMALS = 2`),
 *     and returns the result as a string.
 *   - If `switchValues` is `false`, the function returns the balance as a string.
 * @example
 * ```typescript
 * import { calculateFormattedBalanceAmount } from './your-module';
 *
 * const switchValues = true;
 * const balance = '100';
 * const priceUSD = '1.2';
 *
 * const formattedBalanceAmount = calculateFormattedBalanceAmount(switchValues, balance, priceUSD);
 * console.log(formattedBalanceAmount); // Outputs the balance amount in USD if switchValues is true
 * ```
 */
const calculateFormattedBalanceAmount = (switchValues: boolean, balance: string, priceUSD: string | null) => {
  if (switchValues) {
    return new Decimal(balance)
      .times(new Decimal(priceUSD ?? 0))
      .toDP(USD_DECIMALS)
      .toFixed();
  }
  return balance;
};

/**
 * Formats the balance amount for display, adding a dollar sign if the value should be displayed in USD.
 *
 * @param switchValues - A boolean value that determines whether to display the balance amount
 * with a dollar sign (indicating USD) or without it.
 * @param balance - A string representing the balance amount.
 * @returns A string representing the formatted balance amount based on the provided parameters:
 *   - If `switchValues` is `true`, the function adds a dollar sign before the balance amount and
 *     formats it.
 *   - If `switchValues` is `false`, the function formats the balance amount.
 * @example
 * ```typescript
 * import { displayInUSD } from './your-module';
 *
 * const switchValues = true;
 * const balance = '100';
 *
 * const formattedBalanceAmount = displayInUSD(switchValues, balance);
 * console.log(formattedBalanceAmount); // Outputs "$100" if switchValues is true
 * ```
 */
const displayInUSD = (switchValues: boolean, balance: string) => {
  return `${switchValues ? "$" : ""}${formatAmount(balance)}`;
};

/**
 * Retrieves the formatted balance for display based on the given parameters `switchValues`, `priceUSD`, and `balance`.
 * The balance can be displayed in as amount or converted to USD.
 *
 * @param switchValues - A boolean value that determines whether to display the balance amount
 * in USD or not.
 * @param priceUSD - A string representing the price of the asset in USD, or `null`
 * if the price is not available.
 * @param balance - An optional string representing the balance of the asset.
 * @returns A string representing the formatted balance based on the provided parameters:
 *   - If `balance` is not provided, the function returns "--".
 *   - If `balance` is provided, the function calculates the formatted balance amount
 *
 * @example
 * ```typescript
 * import { getFormattedBalance } from './your-module';
 *
 * const switchValues = true;
 * const priceUSD = '1.2';
 * const balance = '100';
 *
 * const formattedBalance = getFormattedBalance(switchValues, priceUSD, balance);
 * console.log(formattedBalance); // Outputs "$100" if switchValues is true
 * ```
 */
export const getFormattedBalance = (switchValues: boolean, priceUSD: string | null, balance?: string) => {
  if (!balance) return "--";

  const formattedBalanceAmount = calculateFormattedBalanceAmount(switchValues, balance, priceUSD);

  return displayInUSD(switchValues, formattedBalanceAmount);
};

/**
 * Retrieves the appropriate prefix for displaying an amount based on the given parameters `switchValues` and `approx`.
 * The prefix can indicate if the value is in USD and if it is an approximate value.
 *
 * @param switchValues - A boolean value that determines whether the value is in USD.
 * @param approx - A boolean value that determines if the value is an approximate value.
 * @returns A string or undefined representing the appropriate prefix based on the provided parameters:
 *   - If `switchValues` is `true` and `approx` is `true`, the function returns "~$".
 *   - If `switchValues` is `true` and `approx` is `false`, the function returns "$".
 *   - If `switchValues` is `false` and `approx` is `true`, the function returns "~".
 *   - If `switchValues` is `false` and `approx` is `false`, the function returns `undefined`.
 * @example
 * ```typescript
 * import { getPrefix } from './your-module';
 *
 * const switchValues = true;
 * const approx = false;
 *
 * const prefix = getPrefix(switchValues, approx);
 * console.log(prefix); // Outputs "$" if switchValues is true and approx is false
 * ```
 */
export const getPrefix = (switchValues: boolean, approx: boolean) => {
  if (switchValues) {
    return approx ? "~$" : "$";
  }

  return approx ? "~" : undefined;
};

/**
 * Retrieves the appropriate suffix for displaying an amount based on the given parameters `switchValues` and `symbol`.
 * The suffix can indicate the asset symbol.
 *
 * @param switchValues - A boolean value that determines whether the value is in USD.
 * @param symbol - An optional string representing the asset symbol.
 * @returns A string or undefined representing the appropriate suffix based on the provided parameters:
 *   - If `switchValues` is `true`, the function returns `undefined`.
 *   - If `switchValues` is `false`, the function returns the `symbol` parameter.
 * @example
 * ```typescript
 * import { getSuffix } from './your-module';
 *
 * const switchValues = false;
 * const symbol = "ETH";
 *
 * const suffix = getSuffix(switchValues, symbol);
 * console.log(suffix); // Outputs "ETH" if switchValues is false
 * ```
 */
export const getSuffix = (switchValues: boolean, symbol?: string) => {
  return switchValues ? undefined : symbol;
};

/**
 * Counts the number of trailing zeros in a given numeric string value.
 *
 * @param value - A string representing a numeric value.
 * @returns A number representing the count of trailing zeros in the given value.
 * @example
 * ```typescript
 * import { countTrailingZeros } from './your-module';
 *
 * const value = "123.4500";
 *
 * const trailingZerosCount = countTrailingZeros(value);
 * console.log(trailingZerosCount); // Outputs 2 as there are two trailing zeros after the decimal point
 * ```
 */
export const countTrailingZeros = (value: string) => {
  const match = new Decimal(value || "0").toFixed().match(/(?:\.(\d*?)(0+)?)?$/);

  return match && match[2] ? match[2].length : 0;
};
