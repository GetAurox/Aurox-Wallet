import pick from "lodash/pick";
import Decimal from "decimal.js";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, constants, ethers } from "ethers";
import { formatEther, formatUnits, parseUnits } from "ethers/lib/utils";

import { parseEthersRPCError } from "common/errors";
import { JsonRPCProviderWithRetry } from "common/wallet";

import { GasPresetSettings } from "ui/types";

import { EVMFeeManagerInterface } from "../base";

import { EVMFeePreference as FeePreference, TransactionType } from "../types";

import { changeByPercentage } from "../utils";

import { MINIMUM_GAS_LIMIT } from "../constants";

import { FeeConfigurationLegacy, FeeSettings } from "./types";

export class LegacyFeeManager implements EVMFeeManagerInterface<FeeConfigurationLegacy<BigNumber>> {
  #feeSettings: FeeSettings<BigNumber> | null = null;
  #selectedFeePreference: FeePreference = "medium";
  #transaction: TransactionRequest;
  #provider: JsonRPCProviderWithRetry;
  #gasPresets?: GasPresetSettings;

  #error: string | null = null;
  #gasEstimate: BigNumber | null = null;
  #blockNumber = 0;
  #userBalance = constants.Zero;

  #defaultPresetByPreference = {
    gasLimit: {
      "low": 5,
      "medium": 10,
      "high": 20,
    },
  };

  constructor(transaction: TransactionRequest, provider: JsonRPCProviderWithRetry, userBalance: BigNumber, gasPresets?: GasPresetSettings) {
    this.#provider = provider;
    this.#gasPresets = gasPresets;
    this.#userBalance = userBalance;
    this.#transaction = pick(transaction, ["data", "from", "to", "value"]);
  }

  get feePreference() {
    return this.#selectedFeePreference;
  }

  get error() {
    return this.#error;
  }

  get currentFeeSettings(): FeeConfigurationLegacy<BigNumber> | null {
    if (!this.#feeSettings) return null;

    return this.#feeSettings[this.#selectedFeePreference];
  }

  get transaction(): TransactionRequest {
    return {
      ...this.#transaction,
      ...this.feeSettingsForEthereum,
      chainId: this.#provider.network.chainId,
      type: TransactionType.Legacy,
    };
  }

  get feeSettingsForEthereum(): FeeConfigurationLegacy<string> | null {
    if (!this.currentFeeSettings) return null;

    const { gasLimit, gasPrice } = this.currentFeeSettings;

    return {
      type: TransactionType.Legacy,
      gasLimit: gasLimit.toHexString(),
      gasPrice: gasPrice.toHexString(),
    };
  }

  get transactionValue() {
    if (!this.#transaction.value) {
      return constants.Zero;
    }

    return BigNumber.from(this.#transaction.value);
  }

  get hasEnoughFunds() {
    if (!this.currentFeeSettings) {
      return null;
    }

    const { gasPrice, gasLimit } = this.currentFeeSettings;

    const price = gasPrice.mul(gasLimit);

    return this.#userBalance.gt(price.add(this.transactionValue));
  }

  get feeSettingsNormalized(): FeeConfigurationLegacy<string> | null {
    if (!this.currentFeeSettings) return null;

    const { gasLimit, gasPrice } = this.currentFeeSettings;

    return {
      type: TransactionType.Legacy,
      gasLimit: gasLimit.toString(),
      gasPrice: formatUnits(gasPrice, "gwei"),
    };
  }

  get feePrice() {
    if (!this.currentFeeSettings) return null;

    const { gasLimit, gasPrice } = this.currentFeeSettings;

    return gasLimit.mul(gasPrice);
  }

  get feePriceInNativeCurrency() {
    const price = formatEther(this.feePrice ?? constants.Zero);

    return Number(parseFloat(price).toPrecision(6));
  }

  async #estimateGas() {
    try {
      if (!this.#gasEstimate || !this.#gasEstimate.eq(0)) {
        this.#gasEstimate = await this.#provider.estimateGas(this.#transaction);

        this.#error = null;
      }
    } catch (error) {
      this.#error = parseEthersRPCError(error);

      this.#gasEstimate = null;
    }
  }

  async #configureFees() {
    const [gasPrice] = await Promise.all([this.#provider.getGasPrice(), this.#estimateGas()]);

    this.#configureFeesByPreference(gasPrice);
  }

  #configureFeesByPreference(gasPrice: BigNumber) {
    const gasLimit = this.#gasEstimate || this.currentFeeSettings?.gasLimit || BigNumber.from(0);

    const getPreset = (gasPrice: BigNumber, preference: Exclude<FeePreference, "custom">): FeeConfigurationLegacy<BigNumber> => {
      const presetsEnabled = this.#gasPresets?.enabled ?? false;

      const preferenceGasPresets = this.#gasPresets?.[preference] ?? {};

      const gasLimitPresetEnabled = presetsEnabled && preferenceGasPresets.gasLimit !== undefined && !gasLimit.eq(MINIMUM_GAS_LIMIT);
      const gasPricePresetEnabled = presetsEnabled && preferenceGasPresets.gasPrice !== undefined;

      const gasPricePreset = ethers.utils.parseUnits(preferenceGasPresets.gasPrice ?? "0", "gwei");

      const gasLimitPresetPrecentage = new Decimal(preferenceGasPresets.gasLimit ?? "0").toNumber();

      return {
        type: TransactionType.Legacy,
        gasPrice: gasPricePresetEnabled ? gasPricePreset : gasPrice,
        gasLimit: gasLimitPresetEnabled ? changeByPercentage(gasLimit, gasLimitPresetPrecentage) : getGasLimitByPreference(preference),
      };
    };

    const getGasLimitByPreference = (preference: Exclude<FeePreference, "custom">) => {
      const percentage = gasLimit.eq(MINIMUM_GAS_LIMIT) ? 0 : this.#defaultPresetByPreference.gasLimit[preference];

      return changeByPercentage(gasLimit, percentage);
    };

    this.#feeSettings = {
      low: getPreset(gasPrice, "low"),
      medium: getPreset(gasPrice.add(gasPrice.div(4)), "medium"),
      high: getPreset(gasPrice.add(gasPrice.div(2)), "high"),
      custom: this.#feeSettings?.custom ?? null,
    };
  }

  async updateFees() {
    try {
      const block = await this.#provider.getBlock("latest");

      if (block.number === this.#blockNumber) return;

      await this.#configureFees();

      this.#blockNumber = block.number;
    } catch (error) {
      throw new Error(parseEthersRPCError(error));
    }
  }

  changeFeePreference(preference: FeePreference) {
    if (!preference || preference === this.#selectedFeePreference || preference === "custom") return;

    this.#selectedFeePreference = preference;
  }

  changeBaseFee(value: string) {
    throw new Error("Not supported for Legacy transaction");
  }

  changeMaxPriorityFeePerGas(value: string) {
    throw new Error("Not supported for Legacy transaction");
  }

  changeGasLimit(value: string) {
    if (!this.currentFeeSettings || !this.#feeSettings) return;

    try {
      const gasLimit = BigNumber.from(value);

      if (!this.#gasEstimate) {
        this.#gasEstimate = gasLimit;
      }

      this.#feeSettings.custom = {
        ...this.currentFeeSettings,
        gasLimit,
      };

      this.#selectedFeePreference = "custom";
    } catch (error) {
      console.error("Can not update gas limit", error);
    }
  }

  changeGasPrice(value: string) {
    if (!this.currentFeeSettings || !this.#feeSettings) return;

    try {
      const gasPrice = parseUnits(value, "gwei");

      this.#feeSettings.custom = {
        ...this.currentFeeSettings,
        gasPrice,
      };
      this.#selectedFeePreference = "custom";
    } catch (error) {
      console.error("Can not update gas price", error);
    }
  }
}
