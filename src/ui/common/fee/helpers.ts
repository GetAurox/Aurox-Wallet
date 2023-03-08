import { ethers, BigNumber } from "ethers";

import { TokenTicker } from "ui/types";

import { FeePreference, FeeConfiguration } from "./types";

export function getFeeEstimatedSecondsPresentation(seconds: number) {
  // 5+ should be red
  if (seconds > 60 * 5) {
    return { color: "#f24840", text: "> 5 minutes" };
  }

  // < 1 minute should be green
  if (seconds < 60) {
    return { color: "#54c06e", text: "< 1 minute" };
  }

  // 1-5 minute should be yellow
  return { color: "#f6c009", text: `~ ${Math.round(seconds / 60)} minutes` };
}

export function calculateFeeTotal(gasLimit: string | number, maxPriorityFeePerGas: string) {
  const feeNativeAsset = ethers.utils.formatEther(BigNumber.from(maxPriorityFeePerGas).mul(gasLimit));

  return parseFloat(feeNativeAsset);
}

export function getTimeEstimateForPreference(preference: FeePreference) {
  switch (preference) {
    case "low":
      return 60;
    case "medium":
      return 30;
    case "high":
      return 15;
    default:
      throw new Error(`Missing time estimate for preference ${preference}`);
  }
}

export function getGasPricesForPreference(preference: FeePreference, baseFee: string) {
  const maxPriorityFeePerGas = (() => {
    if (preference === "low") return ethers.utils.parseUnits("1.5", "gwei");
    if (preference === "medium") return ethers.utils.parseUnits("2.0", "gwei");
    return ethers.utils.parseUnits("2.5", "gwei");
  })();

  const maxFeePerGas = (() => {
    const baseFeeWithBuffer = BigNumber.from(baseFee).mul(2);

    if (preference === "low") return baseFeeWithBuffer;
    if (preference === "medium") return baseFeeWithBuffer.add(baseFeeWithBuffer.div(2));
    return baseFeeWithBuffer.mul(2);
  })();

  return {
    maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
    maxFeePerGas: maxFeePerGas.add(maxPriorityFeePerGas).toString(),
  };
}

export function getUpdatedFeeFields(
  feeConfiguration: Pick<FeeConfiguration, "baseFee" | "maxPriorityFeePerGas" | "gasLimit">,
  nativeAssetTicker?: TokenTicker | null,
) {
  const feePriceTotal = BigNumber.from(feeConfiguration.baseFee).add(feeConfiguration.maxPriorityFeePerGas).toString();

  const feeNativeAsset = calculateFeeTotal(feeConfiguration.gasLimit, feePriceTotal);

  const feeUSD = parseFloat(nativeAssetTicker?.priceUSD ?? "0") * feeNativeAsset;

  return { feeUSD, feeNativeAsset };
}

export function getUpdatedFeeConfiguration(
  feeConfiguration: Omit<FeeConfiguration, "maxFeePerGas" | "maxPriorityFeePerGas" | "time" | "feeUSD" | "feeNativeAsset">,
  preference: FeePreference,
  nativeAssetTicker?: TokenTicker | null,
): FeeConfiguration {
  const gasPreferences = getGasPricesForPreference(preference, feeConfiguration.baseFee);

  const { feeNativeAsset, feeUSD } = getUpdatedFeeFields(
    {
      baseFee: feeConfiguration.baseFee,
      maxPriorityFeePerGas: gasPreferences.maxPriorityFeePerGas,
      gasLimit: feeConfiguration.gasLimit,
    },
    nativeAssetTicker,
  );

  return {
    ...feeConfiguration,
    maxFeePerGas: gasPreferences.maxFeePerGas,
    maxPriorityFeePerGas: gasPreferences.maxPriorityFeePerGas,
    preference,
    feeNativeAsset,
    feeUSD,
    time: getTimeEstimateForPreference(preference),
  };
}
