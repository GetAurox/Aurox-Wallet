import type { feePreferences } from "./data";

export type FeePreference = typeof feePreferences[number];

export interface FeeConfiguration {
  preference: FeePreference;
  gasLimit: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  baseFee: string;
  feeUSD: number;
  feeNativeAsset: number;
  time: number;
}
