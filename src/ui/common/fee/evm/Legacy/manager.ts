import pick from "lodash/pick";
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, constants } from "ethers";
import { Deferrable, formatEther, formatUnits, parseUnits } from "ethers/lib/utils";

import { EVMSignerPopup } from "ui/common/connections";
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
  #signer: EVMSignerPopup;
  #gasPresets?: GasPresetSettings;

  #blockNumber = 0;
  #userBalance = constants.Zero;

  #defaultPresetByPreference = {
    gasLimit: {
      "low": 5,
      "medium": 10,
      "high": 20,
    },
  };

  constructor(transaction: TransactionRequest, signer: EVMSignerPopup, gasPresets?: GasPresetSettings) {
    this.#signer = signer;
    this.#gasPresets = gasPresets;
    this.#transaction = pick(transaction, ["data", "from", "to", "value"]);
  }

  get feePreference() {
    return this.#selectedFeePreference;
  }

  get currentFeeSettings(): FeeConfigurationLegacy<BigNumber> | null {
    if (!this.#feeSettings) return null;

    return this.#feeSettings[this.#selectedFeePreference];
  }

  get transaction(): Deferrable<TransactionRequest> {
    return { ...this.#transaction, ...this.feeSettingsForEthereum, type: TransactionType.Legacy };
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

  async #configureFees() {
    const [balance, gasLimit, gasPrice] = await Promise.all([
      this.#signer.getBalance(),
      this.#signer.estimateGas(this.#transaction),
      this.#signer.getGasPrice(),
    ]);

    this.#configureFeesByPreference(gasPrice, gasLimit);

    this.#userBalance = balance;
  }

  #configureFeesByPreference(gasPrice: BigNumber, gasLimit: BigNumber) {
    const getPreset = (gasPrice: BigNumber, preference: Exclude<FeePreference, "custom">): FeeConfigurationLegacy<BigNumber> => {
      const presetsEnabled = this.#gasPresets?.enabled ?? false;

      const preferenceGasPresets = this.#gasPresets?.[preference] ?? {};

      const gasLimitPresetEnabled = presetsEnabled && preferenceGasPresets.gasLimit !== undefined;
      const gasPricePresetEnabled = presetsEnabled && preferenceGasPresets.gasPrice !== undefined;

      const gasLimitPreset = BigNumber.from(preferenceGasPresets.gasLimit ?? 0);
      const gasPricePreset = BigNumber.from(preferenceGasPresets.gasPrice ?? 0);

      return {
        type: TransactionType.Legacy,
        gasPrice: gasPricePresetEnabled ? gasPricePreset : gasPrice,
        gasLimit: gasLimitPresetEnabled ? gasLimitPreset : getGasLimitByPreference(preference),
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
      const block = await this.#signer.provider.getBlock("latest");

      if (block.number === this.#blockNumber) return;

      await this.#configureFees();

      this.#blockNumber = block.number;
    } catch (error) {
      console.error("Failed to update fees for legacy transaction", error);
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
