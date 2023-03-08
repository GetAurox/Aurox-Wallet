import { getDecimalPlaces } from "./helpers";

export interface TrailingZeroFadeParts {
  significant: string;
  zeroes: string;
}

export function applyDelimiter(value: string, delimiter = true) {
  if (delimiter) {
    const parts = value.toString().split(".");

    const newDecimalPart = [];

    for (let i = 0, length = parts[0].length; i < length; i++) {
      newDecimalPart.push(parts[0][length - i - 1]);

      if (i % 3 === 2 && i !== length - 1) {
        newDecimalPart.push(",");
      }
    }

    parts[0] = newDecimalPart.reverse().join("");

    return parts.join(".");
  }

  return value;
}

export function getAlignmentFixture(value: number | string, decimalPlaces: number, alignmentLength: number, delimiter = false): string {
  return applyDelimiter(Number(value || 0).toFixed(decimalPlaces), delimiter).padStart(alignmentLength);
}

export function getTrailingZeroFadeParts(
  value: number | string,
  decimalPlaces: number,
  alignmentLength: number,
  delimiter = false,
  prefix = "",
): TrailingZeroFadeParts {
  const numValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numValue) || !Number.isFinite(numValue) || Number.isNaN(decimalPlaces) || Number.isNaN(alignmentLength)) {
    return { significant: "0", zeroes: "" };
  }

  const truncated = Number(numValue.toFixed(decimalPlaces));

  // Either there are decimal places and this one is integer, or there are no decimal points anywhere
  if (Number.isInteger(truncated)) {
    // There are no decimal places on this column, so no fading
    if (decimalPlaces === 0) {
      return {
        significant: (prefix + applyDelimiter(truncated.toFixed(), delimiter)).padStart(alignmentLength),
        zeroes: "",
      };
    }

    // There are decimal places, but this particular value is integer
    // Therefore, we add and fade the entire decimal part
    return {
      significant: (prefix + applyDelimiter(truncated.toFixed(), delimiter)).padStart(alignmentLength - decimalPlaces - 1),
      zeroes: "." + "0".repeat(decimalPlaces),
    };
  }

  // The value is not integer and there might be some trailing zeroes
  const realDecimalPlaces = getDecimalPlaces(truncated);
  const zeroes = decimalPlaces - realDecimalPlaces;

  // The value fills the entire designated decimal places, that means no trailing zeroes
  if (zeroes === 0) {
    return {
      significant: (prefix + applyDelimiter(truncated.toFixed(decimalPlaces), delimiter)).padStart(alignmentLength),
      zeroes: "",
    };
  }

  // There are some trailing zeroes, we should pad the string while keeping that in mind
  return {
    significant: (prefix + applyDelimiter(truncated.toFixed(realDecimalPlaces), delimiter)).padStart(alignmentLength - zeroes),
    zeroes: "0".repeat(zeroes),
  };
}
