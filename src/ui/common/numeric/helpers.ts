// base on https://stackoverflow.com/a/27865285/2625812
export function getDecimalPlaces(value: number) {
  if (!isFinite(value)) {
    return 0;
  }

  let cursor = 1;
  let result = 0;

  while (Math.round(value * cursor) / cursor !== value) {
    cursor *= 10;
    result++;
  }

  return result;
}

// base on https://stackoverflow.com/a/28203456/2625812
export function getPrecision(value: number) {
  value = value * 10 ** getDecimalPlaces(value);

  return Math.max(Math.floor(Math.log10(Math.abs(value))), 0) + 1;
}
