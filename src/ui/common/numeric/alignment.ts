import { getPrecision, getDecimalPlaces } from "./helpers";

function getDefaults<D, K extends keyof D>(keysToAlign: K[], defaultValue: number): { [P in K]: number } {
  const data: { [P in K]: number } = {} as any;

  for (const key of keysToAlign) {
    data[key] = defaultValue;
  }

  return data;
}

export interface FloatingPointAlignmentData<D, K extends keyof D> {
  minimumRequiredLengths: { [P in K]: number };
  alignmentLengths: { [P in K]: number };
  decimalPlaces: { [P in K]: number };
}

export function getFloatingPointAlignmentData<D, K extends keyof D>(
  data: D[],
  keysToAlign: K[],
  maxIntegerParts?: { [P in K]?: number },
): FloatingPointAlignmentData<D, K> {
  const integerPartDigits = getDefaults<D, K>(keysToAlign, 1); // there is always one integer digit (namely zero)
  const minimumRequiredLengths = getDefaults<D, K>(keysToAlign, 1);
  const decimalPlaces = getDefaults<D, K>(keysToAlign, 0);

  for (const item of data) {
    for (const key of keysToAlign) {
      const itemValue = item[key];

      if (itemValue === null || itemValue === undefined) {
        continue;
      }

      if (typeof itemValue !== "number" && typeof itemValue !== "string") {
        continue;
      }

      if (typeof itemValue === "string" && Number.isNaN(Number(String(itemValue).trim()))) {
        continue;
      }

      let itemNum = typeof itemValue === "number" ? (itemValue as number) : Number(String(itemValue).trim() || 0);

      if (!Number.isFinite(itemNum) || Number.isNaN(itemNum)) {
        continue;
      }

      // Forcefully capping to 8 floating digits and ceiling the value;
      itemNum = Number(itemNum.toFixed(8));

      const itemPrecision = getPrecision(itemNum);

      // Decimal digits should max at some point
      const itemDecimalPlaces = Math.min(getDecimalPlaces(itemNum), 8);

      let itemIntegerPartDigits = itemPrecision - itemDecimalPlaces;

      if (maxIntegerParts && typeof maxIntegerParts[key] === "number") {
        itemIntegerPartDigits = Math.min(itemIntegerPartDigits, maxIntegerParts[key]!);
      }

      // Take sign into account
      if (itemNum < 0) {
        if (Math.abs(itemNum) >= 1) {
          // If x >= 1 || x <= -1, just add one for the sign
          itemIntegerPartDigits += 1;
        } else {
          // Otherwise, it should be equal to 2 (one for the sign one for 0, i.e. -0.xxxx)
          itemIntegerPartDigits = 2;
        }
      } else if (Math.abs(itemNum) < 1) {
        // if  x < 1 && x > -1, it should be equal to 1 we need one digit for the zero (0.xxx)
        itemIntegerPartDigits = 1;
      }

      const itemMinimumRequiredLength = itemIntegerPartDigits + (itemDecimalPlaces > 0 ? 1 : 0) + itemDecimalPlaces;

      minimumRequiredLengths[key] = Math.max(minimumRequiredLengths[key], itemMinimumRequiredLength);
      integerPartDigits[key] = Math.max(integerPartDigits[key], itemIntegerPartDigits);
      decimalPlaces[key] = Math.max(decimalPlaces[key], itemDecimalPlaces);
    }
  }

  const alignmentLengths: { [P in K]: number } = {} as any;

  for (const key of keysToAlign) {
    // Add one to the length in case there are decimal digits for the dot
    alignmentLengths[key] = integerPartDigits[key] + decimalPlaces[key] + (decimalPlaces[key] > 0 ? 1 : 0);
  }

  return { minimumRequiredLengths, alignmentLengths, decimalPlaces };
}
