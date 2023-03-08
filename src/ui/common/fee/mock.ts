import random from "lodash/random";

import { FeePreference, FeeConfiguration } from "./types";

export const feeData: Record<FeePreference, FeeConfiguration> = {
  "low": {
    preference: "low",
    gasLimit: "43",
    maxFeePerGas: "52.1533953948",
    maxPriorityFeePerGas: "52.1533953948",
    baseFee: "20",
    feeUSD: 55.33,
    feeNativeAsset: 0.000012,
    time: Math.round(random(300, 600)),
  },
  "medium": {
    preference: "medium",
    gasLimit: "53",
    maxFeePerGas: "65.1533953948",
    maxPriorityFeePerGas: "65.1533953948",
    baseFee: "20",
    feeUSD: 67.33,
    feeNativeAsset: 0.000092,
    time: Math.round(random(60, 300)),
  },
  "high": {
    preference: "high",
    gasLimit: "63",
    maxFeePerGas: "75.1533953948",
    maxPriorityFeePerGas: "75.1533953948",
    baseFee: "20",
    feeUSD: 77.33,
    feeNativeAsset: 0.000102,
    time: Math.round(random(10, 60)),
  },
};
