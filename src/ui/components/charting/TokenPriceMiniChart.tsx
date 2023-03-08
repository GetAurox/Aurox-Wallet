import { useCallback, useEffect, useRef, useState } from "react";
import noop from "lodash/noop";

import { OHLCVSubscriber, subscribeToOHLCV } from "ui/common/connections";
import { GraphQLMarketsAPIPriceHistory, TimePriceLineChartData } from "ui/types";

import { getLineDataFromChartData, getPriceChange24HColor } from "ui/common/charting";

import TimePriceLineChart from "./TimePriceLineChart";

export interface TokenPriceMiniChart {
  priceChange24Hours?: number;
  priceHistory24H: GraphQLMarketsAPIPriceHistory[];
  pairId: number;
}

export default function TokenPriceMiniChart(props: TokenPriceMiniChart) {
  const { priceHistory24H, priceChange24Hours = 0, pairId } = props;

  const [chartData, setChartData] = useState<Record<number, number>>([]);

  const pairIdRef = useRef<number | null>(null);

  const ohlcvUpdateCallback: OHLCVSubscriber = useCallback((pairId, update) => {
    const { timeUnitStart, close } = update;

    setChartData(data => ({
      ...data,
      [timeUnitStart]: close,
    }));
  }, []);

  useEffect(() => {
    let unsubscribe: () => void = noop;

    if (pairId && pairIdRef.current !== pairId) {
      unsubscribe = subscribeToOHLCV([pairId], ohlcvUpdateCallback);
      pairIdRef.current = pairId;
    }

    return () => {
      unsubscribe();
      pairIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairId]);

  useEffect(() => {
    setChartData(getLineDataFromChartData(priceHistory24H));
  }, [priceHistory24H]);

  const renderData: TimePriceLineChartData = [];

  for (const [time, value] of Object.entries(chartData)) {
    renderData.push({ time: Number(time), value });
  }

  return (
    <TimePriceLineChart
      data={renderData}
      width={60}
      height={30}
      lineOptions={{
        lineWidth: 1,
        color: getPriceChange24HColor(priceChange24Hours),
      }}
    />
  );
}
