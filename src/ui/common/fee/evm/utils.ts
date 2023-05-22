import Decimal from "decimal.js";
import { BigNumber, constants, ethers } from "ethers";

export function getMedian(values: Decimal[]) {
  if (values.length === 0) return new Decimal(0);

  if (values.length === 1) return values[0];

  const sorted = Array.from(values).sort((a, b) => (a.lt(b) ? -1 : 1));
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return sorted[middle - 1].add(sorted[middle]).div(2);
  }

  return sorted[middle];
}

export function humanizeValue(value: BigNumber) {
  return ethers.utils.formatUnits(value, "gwei");
}

/** Create a new value increased or decreased by the provided percentage.
 * Take care of the percentage decimal points, since it can mess with clumsy big numbers
 * @param value - value to modify
 * @param percentage - percentage to increase/decrease by
 * @example - Increase by 50%
 * changeByPercentage(100, 50) // outputs 150
 *  - Decrease by 50%
 *  changeByPercentage(100, -50) // outputs 50
 */
export function changeByPercentage(value: BigNumber, percentage: number) {
  if (percentage === 0) {
    return value;
  }

  const percentageDecimal = new Decimal(percentage);

  if (percentageDecimal.lt(-100)) {
    return constants.Zero;
  }

  const valueDecimal = new Decimal(value.toHexString());

  const factor = valueDecimal.div(new Decimal(100).div(percentageDecimal.toDP(2)));

  return BigNumber.from(valueDecimal.add(factor).toDP(0).toHex());
}
