// Heavily based on https://github.com/domharrington/js-number-abbreviate

const UNITS = ["K", "M", "B", "T", "P", "E", "Z", "Y"];

export function abbreviateValue(num: number, decimalPlaces: number) {
  const precision = Math.pow(10, decimalPlaces);

  let abbreviatedNum = num;

  for (let i = UNITS.length - 1; i >= 0; i--) {
    const size = Math.pow(10, (i + 1) * 3);

    if (size <= abbreviatedNum) {
      abbreviatedNum = Math.round((abbreviatedNum * precision) / size) / precision;

      if (abbreviatedNum === 1000 && i < UNITS.length - 1) {
        abbreviatedNum = 1;
        i++;
      }

      return { abbreviated: `${abbreviatedNum.toFixed(decimalPlaces)}${UNITS[i]}`, value: abbreviatedNum, unit: UNITS[i] };
    }
  }

  return { abbreviated: `${abbreviatedNum.toFixed(decimalPlaces)}`, value: abbreviatedNum, unit: "" };
}

export function abbreviate(num: number, decimalPlaces = 0) {
  const isNegative = num < 0;
  const { abbreviated: abbreviatedNumber } = abbreviateValue(Math.abs(num), decimalPlaces);

  return isNegative ? "-" + abbreviatedNumber : abbreviatedNumber;
}
