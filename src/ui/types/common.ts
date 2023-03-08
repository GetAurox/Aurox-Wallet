export type SupportedNetworkIdentifier = "ethereum" | "goerli" | "bsc" | "polygon" | "avalanche" | "fantom" | "arbitrum" | "optimism";

export type SupportedNetworkChain =
  | 1
  | 56
  | 137
  | 43114
  | 250
  | 42161
  | 10
  | 20
  | 25
  | 30
  | 57
  | 59
  | 61
  | 88
  | 100
  | 106
  | 128
  | 199
  | 246
  | 288
  | 314
  | 321
  | 361
  | 888
  | 1294
  | 2000
  | 4689
  | 10000
  | 32520
  | 32659
  | 100001
  | 100002
  | 100003
  | 100004
  | 100005
  | 100006
  | 100007
  | 100008
  | 1313161554
  | 1666600000;

export type ChartPeriod = "1H" | "1D" | "1W" | "1M" | "1Y" | "ALL";

export type TimePriceLineChartDataItem = { time: number; value: number };
export type TimePriceLineChartData = TimePriceLineChartDataItem[];

export type SortDirection = "asc" | "desc";

export interface SortSetting {
  prop: string;
  dir: SortDirection;
}

// This type function applies Omit<T, K> to all types within a union
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export interface EtherscanGasPriceOracleResponse {
  status: string;
  message: string;
  result: {
    LastBlock: string;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    suggestBaseFee: string;
    gasUsedRatio: string;
  };
}
