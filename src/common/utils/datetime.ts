const TIME_UNIT_IN_MILLISECONDS = {
  "millisecond": 1,
  "second": 1000,
  "minute": 1000 * 60,
  "hour": 1000 * 60 * 60,
};

export type TimeUnit = keyof typeof TIME_UNIT_IN_MILLISECONDS;

export interface Options {
  unit: TimeUnit;

  amount: number;
}

export function getTimeInMilliseconds(options: Options) {
  const { unit, amount } = options;

  if (amount <= 0) return 0;

  return TIME_UNIT_IN_MILLISECONDS[unit] * amount;
}
