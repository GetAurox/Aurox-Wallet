import moment from "moment";

import { GraphQLMarketsAPIPriceHistory, ChartPeriod, TimePriceLineChartData } from "ui/types";
import { defaultTheme } from "ui/common/theme";

export function getPeriodCorrespondingTimeUnit(period: ChartPeriod): string {
  switch (period) {
    case "1H":
      return "5_minute";
    case "1D":
      return "5_minute";
    case "1W":
      return "1_hour";
    case "1M":
      return "4_hour";
    case "1Y":
      return "1_day";
    case "ALL":
      return "1_day";
  }
}

export function getPeriodStartTime(period: ChartPeriod) {
  switch (period) {
    case "1H":
      return moment().subtract(1, "hour").valueOf();
    case "1D":
      return moment().subtract(1, "day").valueOf();
    case "1W":
      return moment().subtract(1, "week").valueOf();
    case "1M":
      return moment().subtract(1, "month").valueOf();
    case "1Y":
      return moment().subtract(1, "year").valueOf();
  }
}

export function getLineDataFromChartData(chartData: GraphQLMarketsAPIPriceHistory[]) {
  const result: Record<number, number> = {};

  for (const { time, price } of chartData) {
    result[time] = Number(price);
  }

  return result;
}

export function getPriceChange24HColor(value: number): string {
  if (value > 0) {
    return defaultTheme.palette.success.main;
  }

  if (value < 0) {
    return defaultTheme.palette.error.main;
  }

  return defaultTheme.palette.text.secondary;
}

/**
 * Searches for closest entry in the collection of { time: number; value: number }[] by given timestamp (time)
 * @param data - collection of items to search
 * @param timestamp - target time to look for
 * @returns entry `{ time: number; value: number }` - closest entry
 */
export function getChartClosestPoint(data: TimePriceLineChartData, timestamp?: number | null) {
  if (typeof timestamp !== "number") {
    return null;
  }

  let delta: number | null = null;
  let point: TimePriceLineChartData[0] | null = null;

  for (const entry of data) {
    const timeDiff = Math.abs(timestamp - entry.time);

    if (timeDiff === 0) {
      return entry;
    }

    if (delta === null) {
      delta = timeDiff;
      point = entry;

      continue;
    }

    if (delta < timeDiff) {
      continue;
    } else {
      delta = timeDiff;
      point = entry;
    }
  }

  return point;
}
