import memoize from "lodash/memoize";
import moment from "moment";

import { ChartPeriod } from "ui/types";

export const formatTimeCrosshairByPeriod = memoize(function formatTimeCrosshairByPeriod(period: ChartPeriod = "ALL") {
  return (time: { day: number; month: number; year: number } | number) => {
    if (typeof time === "number") {
      const date = moment(time);

      switch (period) {
        case "1H":
          return date.format("HH:mm");
        case "1D":
          return date.format("HH:mm");
        case "1W":
          return date.format("ddd, HH:mm");
        case "1M":
          return date.format("MMM D");
        case "1Y":
          return date.format("MMM D");
        case "ALL":
          return date.format("MMM D, YYYY");
      }
    } else {
      return `${time.year}-${time.month}-${time.day}`;
    }
  };
});
