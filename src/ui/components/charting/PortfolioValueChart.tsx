import { MouseEvent, useEffect } from "react";

import { Box, BoxProps, LinearProgress, Stack } from "@mui/material";

import { supportedChartPeriods } from "ui/common/charting";
import { useLocalUserPreferences, usePortfolioHistoricalBalance, useControllableDeferredValue } from "ui/hooks";
import { ChartPeriod, TimePriceLineChartData } from "ui/types";

import AlertStatus from "ui/components/common/AlertStatus";

import TimePriceLineChart from "./TimePriceLineChart";
import ChartPeriodButton from "./ChartPeriodButton";

export interface PortfolioValueChartProps extends BoxProps {
  accountAddress: string;
}

export default function PortfolioValueChart(props: PortfolioValueChartProps) {
  const { accountAddress, ...boxProps } = props;

  const [userPreferences, setUserPreferences] = useLocalUserPreferences();

  const selectedPeriod = userPreferences.portfolioChartPeriod;

  const { data, loading, error } = usePortfolioHistoricalBalance(accountAddress, selectedPeriod);

  const {
    deferredValue: deferredPeriod,
    startDeferring: startPeriodDeferring,
    stopDeferring: stopPeriodDeferring,
  } = useControllableDeferredValue(selectedPeriod);

  const handleChangePeriod = (event: MouseEvent<HTMLButtonElement>, period: ChartPeriod) => {
    event.preventDefault();

    startPeriodDeferring();

    setUserPreferences(preferences => ({ ...preferences, portfolioChartPeriod: period }));
  };

  useEffect(() => {
    if (!loading) {
      stopPeriodDeferring();
    }
  }, [loading, stopPeriodDeferring]);

  const renderData: TimePriceLineChartData = [];

  for (const { time, value } of data) {
    renderData.push({ time: Number(time), value: Number(value) });
  }

  return (
    <Box {...boxProps}>
      <AlertStatus error={!loading && !!error} errorText={error} />
      <TimePriceLineChart data={renderData} height={150} period={deferredPeriod} hasMarker hasTooltip />
      {loading && data.length > 0 && <LinearProgress />}
      <Stack direction="row" justifyContent="space-between" mt={loading && data.length > 0 ? 0.5 : 1}>
        {supportedChartPeriods.map(period => (
          <ChartPeriodButton key={period} period={period} active={selectedPeriod === period} onClick={handleChangePeriod} />
        ))}
      </Stack>
    </Box>
  );
}
