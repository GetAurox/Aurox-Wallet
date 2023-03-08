import { getPeriodCorrespondingTimeUnit, getPeriodStartTime } from "ui/common/charting";
import { OHLCV_BASE_URL } from "common/config";
import { ChartPeriod } from "ui/types";

import { useFetch } from "../utils";

interface ChartDataResponse {
  columns: ["timeUnitStart", "timeOpen", "timeClose", "open", "high", "low", "close", "volume"];
  data: number[][];
}

export function useChartData(pairId: number, period: ChartPeriod = "1D") {
  const timeUnit = getPeriodCorrespondingTimeUnit(period);
  const timeStart = getPeriodStartTime(period);

  const { response, loading, error } = useFetch<ChartDataResponse>(
    {
      refetchInterval: undefined,
      method: "GET",
      baseURL: OHLCV_BASE_URL,
      url: "/history",
      params: {
        pair_id: pairId,
        time_unit: timeUnit,
        time_start: timeStart ?? 0,
        time_end: Date.now(),
      },
    },
    [pairId, period],
  );

  return { response: response?.data?.data ?? [], loading, error };
}
