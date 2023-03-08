import { BigNumber, ethers } from "ethers";

export function getMedian(values: BigNumber[]) {
  if (values.length === 0) return ethers.constants.Zero;

  if (values.length === 1) return values[0];

  const sorted = Array.from(values).sort((a, b) => a.toNumber() - b.toNumber());
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return sorted[middle - 1].add(sorted[middle]).div(2);
  }

  return sorted[middle];
}

export function roundBigNumberToDecimals(value: string | BigNumber, decimals = 2) {
  const parsedValue = BigNumber.from(value);

  const valueInGwei = ethers.utils.formatUnits(parsedValue, "gwei");

  const roundedValue = Number(valueInGwei).toFixed(decimals);

  return ethers.utils.parseUnits(roundedValue.toString(), "gwei");
}

export function humanizeValue(value: BigNumber) {
  return ethers.utils.formatUnits(value, "gwei");
}
