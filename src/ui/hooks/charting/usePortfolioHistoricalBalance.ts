import { useEffect, useState } from "react";
import moment from "moment";
import axios from "axios";

import keyBy from "lodash/keyBy";
import uniq from "lodash/uniq";
import sortBy from "lodash/sortBy";

import { GraphQLEthereumAccountHistoricalBalanceValueUSDResponse, ChartPeriod } from "ui/types";
import { evmNetworkGraphqlAPI, GRAPHQL_LEECHER_X_API_KEY } from "common/config";
import { getTimeInMilliseconds } from "common/utils";

const timeInterval = {
  "1H": "{duration: 1, timeUnit: minute}",
  "1D": "{duration: 5, timeUnit: minute}",
  "1W": "{duration: 1, timeUnit: hour}",
  "1M": "{duration: 4, timeUnit: hour}",
  "1Y": "{duration: 1, timeUnit: day}",
  "ALL": "{duration: 1, timeUnit: day}",
};

function getTimeInterval(period: ChartPeriod) {
  return timeInterval[period] ?? timeInterval["1H"];
}

const timeIntervalToPeriodMapping = {
  "1H": getTimeInMilliseconds({ unit: "minute", amount: 1 }),
  "1D": getTimeInMilliseconds({ unit: "minute", amount: 5 }),
  "1W": getTimeInMilliseconds({ unit: "hour", amount: 1 }),
  "1M": getTimeInMilliseconds({ unit: "hour", amount: 4 }),
  "1Y": getTimeInMilliseconds({ unit: "hour", amount: 24 }),
  "ALL": getTimeInMilliseconds({ unit: "hour", amount: 24 }),
};

function getTimeIntervalInMilliseconds(period: ChartPeriod) {
  return timeIntervalToPeriodMapping[period] ?? timeIntervalToPeriodMapping["1H"];
}

function getPeriodStartTime(period: Exclude<ChartPeriod, "ALL">) {
  switch (period) {
    case "1H":
      return moment().subtract(1, "hour").toISOString();
    case "1D":
      return moment().subtract(1, "day").toISOString();
    case "1W":
      return moment().subtract(1, "week").toISOString();
    case "1M":
      return moment().subtract(1, "month").toISOString();
    case "1Y":
      return moment().subtract(1, "year").toISOString();
  }
}

type Responses = PromiseSettledResult<{ data: GraphQLEthereumAccountHistoricalBalanceValueUSDResponse }>[];

function mergeData(responses: Responses, period: ChartPeriod, timeStart: string) {
  const result: Record<number, Data> = {};

  let allTimestamps: number[] = [];
  const allData: Record<number, { time: number; value: string }>[] = [];
  const prevValues: number[] = [];

  for (const response of responses) {
    if (response.status === "fulfilled") {
      const data = keyBy(response.value.data?.data?.ethereum?.account?.historicalBalance?.valueUSD ?? [], "time");

      // Preparing data
      allTimestamps.push(...Object.keys(data).map(Number));
      allData.push(data);
      prevValues.push(Number(Object.values(data)[0]?.value || 0));
    }
  }

  allTimestamps = sortBy(uniq(allTimestamps));

  let firstTimestamp = allTimestamps[0];

  const timestampsForZeroValues: number[] = [];

  const timeIntervalInMilliseconds = getTimeIntervalInMilliseconds(period);
  const timeStartInMilliseconds = moment(timeStart).valueOf();

  while (true) {
    const timestamp = firstTimestamp - timeIntervalInMilliseconds;

    if (timestamp > timeStartInMilliseconds) {
      allTimestamps.push(timestamp);

      firstTimestamp -= timeIntervalInMilliseconds;

      timestampsForZeroValues.push(timestamp);
    } else {
      break;
    }
  }

  allTimestamps = sortBy(allTimestamps);

  for (const timestamp of allTimestamps) {
    result[timestamp] = {
      time: Number(timestamp),
      value: 0,
    };

    if (timestampsForZeroValues.includes(timestamp)) {
      continue;
    }

    for (let i = 0; i < allData.length; i++) {
      const data = allData[i];

      if (data[timestamp]?.value) {
        const value = Number(data[timestamp].value);

        result[timestamp].value += value;
        prevValues[i] = value;
      } else {
        result[timestamp].value += prevValues[i];
      }
    }
  }

  return Object.values(result);
}

export type Data = {
  time: number;
  value: number;
};

export function usePortfolioHistoricalBalance(accountAddress: string, period: ChartPeriod) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [data, setData] = useState<Data[]>([]);

  useEffect(() => {
    let mounted = true;

    const timeInterval = getTimeInterval(period);
    const timeStart = period === "ALL" ? null : getPeriodStartTime(period);
    const timeEnd = period === "ALL" ? null : new Date().toISOString();

    const valueUSDArgs =
      timeStart && timeEnd
        ? `timeInterval: ${timeInterval}, timeRange: {start: "${timeStart}", end: "${timeEnd}"}`
        : `timeInterval: ${timeInterval}`;

    const getRequest = (url: string) => {
      return axios.request<{ query: string }, { data: GraphQLEthereumAccountHistoricalBalanceValueUSDResponse }>({
        method: "POST",
        url: url,
        headers: { "X-API-Key": GRAPHQL_LEECHER_X_API_KEY },
        data: {
          query: `{
          ethereum(maxDecimals:4) {
            account(accountAddress: "${accountAddress}") {
              historicalBalance {
                  valueUSD (${valueUSDArgs}) {
                      time: timeOpen(format:unix_ms)
                      value: valueClose
                  }
              }
            }
          }
        }
        `,
        },
      });
    };

    const fetch = async () => {
      try {
        setLoading(true);
        setError(undefined);

        const responses = await Promise.allSettled([...Object.values(evmNetworkGraphqlAPI).map(item => getRequest(item.baseURL))]);

        const result = mergeData(responses, period, timeStart !== null ? timeStart : "");

        if (mounted) setData(result);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();

    return () => {
      mounted = false;
    };
  }, [accountAddress, period]);

  return { data, loading, error };
}
