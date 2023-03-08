import { startOfTimeUnit, ohlcvTimeUnitFromString, OHLCVTimeUnit } from "@aurox/ohlcv-helpers";
import { useEffect, useState, MouseEvent, useRef } from "react";
import axios, { AxiosResponse } from "axios";

import { Box, LinearProgress, Stack } from "@mui/material";

import { OHLCV_BASE_URL } from "common/config";

import { getPeriodCorrespondingTimeUnit, getPeriodStartTime, supportedChartPeriods } from "ui/common/charting";
import { ChartPeriod, TimePriceLineChartData } from "ui/types";
import { subscribeToOHLCV } from "ui/common/connections";

import AlertStatus from "ui/components/common/AlertStatus";

import TimePriceLineChart from "./TimePriceLineChart";
import ChartPeriodButton from "./ChartPeriodButton";

export const TOKEN_CHART_HEIGHT = 255;

export interface TokenPriceChartProps {
  pairId?: number | null;
}

export default function TokenPriceChart(props: TokenPriceChartProps) {
  const { pairId } = props;

  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>("1D");
  const [chartData, setChartData] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const timeUnitRef = useRef<OHLCVTimeUnit | null>(null);

  timeUnitRef.current = ohlcvTimeUnitFromString(getPeriodCorrespondingTimeUnit(selectedPeriod));

  const handleChangePeriod = (event: MouseEvent<HTMLButtonElement>, period: ChartPeriod) => {
    event.preventDefault();

    setSelectedPeriod(period);
  };

  useEffect(() => {
    if (typeof pairId !== "number") {
      return;
    }

    return subscribeToOHLCV([pairId], (pairId, { timeUnitStart, close }) => {
      if (timeUnitRef.current) {
        const targetTimeUnitStart = startOfTimeUnit(timeUnitStart, timeUnitRef.current);

        setChartData(data => ({ ...data, [targetTimeUnitStart]: close }));
      }
    });
  }, [pairId]);

  useEffect(() => {
    let mounted = true;

    const fetchChartData = async (pairId: number, period: ChartPeriod) => {
      try {
        const timeUnit = getPeriodCorrespondingTimeUnit(period);
        const timeStart = getPeriodStartTime(period);

        if (mounted) {
          setLoading(true);
          setError(undefined);
        }

        const response: AxiosResponse<{
          columns: ["timeUnitStart", "timeOpen", "timeClose", "open", "high", "low", "close", "volume"];
          data: number[][];
        }> = await axios({
          method: "GET",
          url: "/history",
          baseURL: OHLCV_BASE_URL,
          params: {
            pair_id: pairId,
            time_unit: timeUnit,
            time_start: timeStart ?? 0,
            time_end: Date.now(),
          },
        });

        const mapping: Record<number, number> = Object.fromEntries(response.data.data.map(entry => [entry[0], entry[6]]));

        if (mounted) {
          setChartData(mapping);
        }
      } catch (e) {
        if (mounted) {
          setError(e.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (typeof pairId === "number") {
      fetchChartData(pairId, selectedPeriod);
    }

    return () => {
      mounted = false;
    };
  }, [pairId, selectedPeriod]);

  if (typeof pairId !== "number") {
    return <></>;
  }

  const renderData: TimePriceLineChartData = [];

  for (const [time, value] of Object.entries(chartData)) {
    renderData.push({ time: Number(time), value });
  }

  const isEmpty = renderData.length === 0;

  return (
    <Box px={2} py={3}>
      <AlertStatus error={!loading && !!error} errorText={error} />
      <TimePriceLineChart data={renderData} height={TOKEN_CHART_HEIGHT} period={selectedPeriod} hasMarker hasTooltip />
      {!isEmpty && loading && <LinearProgress />}
      <Stack direction="row" justifyContent="space-between" mt={loading && !isEmpty ? 0.5 : 1}>
        {supportedChartPeriods.map(period => (
          <ChartPeriodButton key={period} period={period} active={selectedPeriod === period} onClick={handleChangePeriod} />
        ))}
      </Stack>
    </Box>
  );
}
