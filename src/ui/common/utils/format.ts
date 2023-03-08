import numbro from "numbro";

export const TEN_MILLIONS = 1e7;
export const ONE_HUNDRED_MILLIONS = 1e8;
export const ONE_HUNDRED_BILLIONS = 1e11;

export function unformat(value: string) {
  const result = numbro.unformat(value);

  return Number.isNaN(result) ? 0 : result;
}

export function unformattedAmount(value?: string): number {
  if (!value) {
    return 0;
  }

  if (value.charAt(0) === "₿" || value.charAt(0) === "Ξ") {
    return numbro.unformat(value.substring(1, value.length)) || 0;
  }

  return numbro.unformat(value) || 0;
}

export function getReasonableMantissa(value: number | string) {
  let number = value;

  if (typeof value === "string") {
    number = Number(value);
  }

  if (number < 1e-6) {
    return 8;
  } else if (number < 1e-4) {
    return 6;
  } else if (number < 1) {
    return 4;
  } else if (number < 10) {
    return 3;
  } else {
    return 2;
  }
}

export function formatPrice(value: number | string, options?: numbro.Format) {
  return numbro(value).format({
    mantissa: getReasonableMantissa(value),
    thousandSeparated: true,
    optionalMantissa: true,
    ...(options || {}),
  });
}

export const formatValue = formatPrice;
export const formatTotal = formatPrice;
export const formatAmount = formatPrice;

export function formatPercents(value: number | string, options?: numbro.Format) {
  return numbro(value).format({
    average: true,
    forceSign: true,
    thousandSeparated: true,
    mantissa: 2,
    optionalMantissa: true,
    ...(options || {}),
  });
}

export function formatAbbreviated(value: number | string, options?: numbro.Format & { lowercase: false }) {
  return numbro(value)
    .format({
      average: true,
      thousandSeparated: true,
      mantissa: 2,
      spaceSeparated: true,
      optionalMantissa: true,
      ...(options || {}),
    })
    [options?.lowercase ? "toLowerCase" : "toUpperCase"]();
}

export function formatValueUSD(value: number | string, options?: numbro.Format): string {
  let retVal = `$${formatPrice(value, options)}`;

  if (value === -1 || value >= ONE_HUNDRED_MILLIONS) {
    retVal = "Unlimited";
  }

  return retVal;
}

export function formatValueFromAmountAndPrice(amount: number, price: number, prefix?: string) {
  const value = amount * price;

  return prefix ? prefix + formatAmount(value) : formatPrice(value);
}

/** If balance exceeds abbreviateFrom value or 100 billions by default, abbreviate the value */
export function formatBalance(balance: string | number | undefined, abbreviateFrom: number = ONE_HUNDRED_BILLIONS) {
  return Number(balance || "0") > abbreviateFrom ? formatAbbreviated(balance || "0") : formatAmount(balance || "0");
}
