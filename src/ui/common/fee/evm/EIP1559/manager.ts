import pick from "lodash/pick";
import { BigNumber, constants } from "ethers";
import { Deferrable, formatEther, hexlify, parseUnits } from "ethers/lib/utils";
import { Block, TransactionRequest } from "@ethersproject/abstract-provider";

import { EVMSignerPopup } from "ui/common/connections";

import { Matrix } from "common/utils";

import { GasPresetSettings } from "ui/types";

import { EVMFeePreference as FeePreference, TransactionType } from "../types";

import { EVMFeeManagerInterface } from "../base";

import { changeByPercentage, getMedian, humanizeValue, roundBigNumberToDecimals } from "../utils";

import { MINIMUM_GAS_LIMIT } from "../constants";

import { FeeSettings, FeeConfigurationEIP1559, FeeHistory, MaxPriorityFeePerGasMap } from "./types";

export class EIP1559FeeManager implements EVMFeeManagerInterface<FeeConfigurationEIP1559<BigNumber>> {
  #feeSettings: FeeSettings<BigNumber> | null = null;
  #selectedFeePreference: FeePreference = "medium";
  #transaction: TransactionRequest;
  #signer: EVMSignerPopup;
  #gasPresets?: GasPresetSettings;

  #blockNumber = 0;
  #userBalance = constants.Zero;

  // This indicates that the chain supports EIP1559,
  // however they do not comply entirely with EIP1559 standards
  #isCustomEIP1559: boolean | null = null;

  #gasEstimate: BigNumber | null = null;
  #maxPriorityFeePerGasHistory = new Matrix<string>([]);

  #defaultPresetByPreference = {
    gasLimit: {
      "low": 5,
      "medium": 10,
      "high": 20,
    },
    baseFee: {
      "low": 0,
      "medium": 12.5,
      "high": 50,
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

  get currentFeeSettings(): FeeConfigurationEIP1559<BigNumber> | null {
    if (!this.#feeSettings) return null;

    return this.#feeSettings[this.#selectedFeePreference];
  }

  get transaction(): Deferrable<TransactionRequest> {
    return { ...this.#transaction, ...this.feeSettingsForEthereum, type: TransactionType.EIP1559 };
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

    const { maxFeePerGas, gasLimit } = this.currentFeeSettings;

    const price = maxFeePerGas.mul(gasLimit);

    return this.#userBalance.gt(price.add(this.transactionValue));
  }

  get feeSettingsForEthereum(): FeeConfigurationEIP1559<string> | null {
    if (!this.currentFeeSettings) return null;

    const { maxFeePerGas, maxPriorityFeePerGas, baseFee, gasLimit } = this.currentFeeSettings;

    return {
      type: TransactionType.EIP1559,
      maxFeePerGas: maxFeePerGas.toHexString(),
      maxPriorityFeePerGas: maxPriorityFeePerGas.toHexString(),
      baseFee: baseFee.toHexString(),
      gasLimit: gasLimit.toHexString(),
    };
  }

  get feeSettingsNormalized(): FeeConfigurationEIP1559<string> | null {
    if (!this.currentFeeSettings) return null;

    const { maxFeePerGas, maxPriorityFeePerGas, baseFee, gasLimit } = this.currentFeeSettings;

    return {
      type: TransactionType.EIP1559,
      maxFeePerGas: humanizeValue(maxFeePerGas),
      maxPriorityFeePerGas: humanizeValue(maxPriorityFeePerGas),
      baseFee: humanizeValue(baseFee),
      gasLimit: gasLimit.toString(),
    };
  }

  get feePrice() {
    if (!this.currentFeeSettings) return null;

    const { gasLimit, maxFeePerGas } = this.currentFeeSettings;

    return gasLimit.mul(maxFeePerGas);
  }

  get feePriceInNativeCurrency() {
    const price = formatEther(this.feePrice ?? constants.Zero);

    return Number(parseFloat(price).toPrecision(6));
  }

  async #estimateGas() {
    if (!this.#gasEstimate) {
      this.#gasEstimate = await this.#signer.estimateGas(this.#transaction);
    }

    return this.#gasEstimate;
  }

  async #getFeeHistory(numberOfBlocksToTake: number, percentiles = [25, 50, 75]) {
    try {
      return (await this.#signer.provider.send("eth_feeHistory", [numberOfBlocksToTake, "latest", percentiles])) as FeeHistory;
    } catch (error) {
      console.error("Failed to get 'eth_feeHistory', attempting with block number in hex", error);
    }

    try {
      return (await this.#signer.provider.send("eth_feeHistory", [hexlify(numberOfBlocksToTake), "latest", percentiles])) as FeeHistory;
    } catch (error) {
      console.error("Failed to get 'eth_feeHistory' with hexlified value, please report this issue..", error);
    }

    throw new Error("Failed to get fee history");
  }

  async #configureFees(block: Block) {
    if (!block.baseFeePerGas) {
      throw new Error("Failed to get the base fee from the block. Possible that the chain is not EIP1559 compliant");
    }

    const [balance, estimatedGas, maxPriorityFeePerGasMap] = await Promise.all([
      this.#signer.getBalance(),
      this.#estimateGas(),
      this.#maxPriorityFeePerGasMap(block.number),
    ]);

    this.#userBalance = balance;

    this.#configureFeesByPreference(estimatedGas, block.baseFeePerGas, maxPriorityFeePerGasMap);
  }

  /** Handles case when there is incorrect implementation of eth_maxPriorityFeePerGas call */
  async #handleCustomEIP1559() {
    const { maxPriorityFeePerGas } = await this.#signer.getFeeData();

    if (!maxPriorityFeePerGas) {
      throw new Error("This is not EIP1559 compliant chain");
    }

    return [
      maxPriorityFeePerGas.toHexString(),
      changeByPercentage(maxPriorityFeePerGas, 25).toHexString(),
      changeByPercentage(maxPriorityFeePerGas, 50).toHexString(),
    ];
  }

  async #maxPriorityFeePerGasMap(blockNumber: number, defaultBlockCount = 4): Promise<MaxPriorityFeePerGasMap> {
    const blockDifference = blockNumber - this.#blockNumber;

    if (blockDifference !== 0 && !this.#isCustomEIP1559) {
      const numberOfBlocksToTake = blockDifference < defaultBlockCount ? blockDifference : defaultBlockCount;

      const { reward, baseFeePerGas } = await this.#getFeeHistory(numberOfBlocksToTake);

      const rewardMatrix = new Matrix(reward);

      const isBaseFeePerGasConstant = baseFeePerGas.every((_, index) => index === 0 || baseFeePerGas[index] === baseFeePerGas[index - 1]);

      this.#isCustomEIP1559 = this.#isCustomEIP1559 || isBaseFeePerGasConstant;

      if (!this.#isCustomEIP1559) {
        this.#maxPriorityFeePerGasHistory.slice(numberOfBlocksToTake).join(rewardMatrix);
      }
    }

    if (this.#isCustomEIP1559) {
      const reward = await this.#handleCustomEIP1559();

      this.#maxPriorityFeePerGasHistory.slice(this.#maxPriorityFeePerGasHistory.shape.rows).add(reward);
    }

    const newMaxPriorityFeePerGas = this.#maxPriorityFeePerGasHistory.apply(roundBigNumberToDecimals).transpose().toArray();

    const [low, medium, high] = newMaxPriorityFeePerGas.map(getMedian);

    return { low, medium, high };
  }

  #configureFeesByPreference(gasLimit: BigNumber, baseFee: BigNumber, maxPriorityFeePerGasMap: any) {
    const getPreset = (
      maxPriorityFeePerGas: BigNumber,
      preference: Exclude<FeePreference, "custom">,
    ): FeeConfigurationEIP1559<BigNumber> => {
      const presetsEnabled = this.#gasPresets?.enabled ?? false;

      const preferenceGasPresets = this.#gasPresets?.[preference] ?? {};

      const gasLimitPresetEnabled = presetsEnabled && preferenceGasPresets.gasLimit !== undefined;
      const baseFeePresetEnabled = presetsEnabled && preferenceGasPresets.baseFee !== undefined;
      const maxPriorityFeePerGasPresetEnabled = presetsEnabled && preferenceGasPresets.priorityFee !== undefined;

      const gasLimitPreset = BigNumber.from(preferenceGasPresets.gasLimit ?? 0);
      const baseFeePreset = BigNumber.from(preferenceGasPresets.baseFee ?? 0);
      const maxPriorityFeePerGasPreset = BigNumber.from(preferenceGasPresets.priorityFee ?? 0);

      const baseFeeValue = baseFeePresetEnabled ? baseFeePreset : getBaseFeeByPreference(preference);
      const gasLimitValue = gasLimitPresetEnabled ? gasLimitPreset : getGasLimitByPreference(preference);
      const maxPriorityFeePerGasValue = maxPriorityFeePerGasPresetEnabled ? maxPriorityFeePerGasPreset : maxPriorityFeePerGas;

      return {
        type: TransactionType.EIP1559,
        baseFee: baseFeeValue,
        gasLimit: gasLimitValue,
        maxPriorityFeePerGas: maxPriorityFeePerGasValue,
        maxFeePerGas: this.#calculateMaxFeePerGas(baseFeeValue, maxPriorityFeePerGasValue),
      };
    };

    const getGasLimitByPreference = (preference: Exclude<FeePreference, "custom">) => {
      const percentage = gasLimit.eq(MINIMUM_GAS_LIMIT) ? 0 : this.#defaultPresetByPreference.gasLimit[preference];

      return changeByPercentage(gasLimit, percentage);
    };

    const getBaseFeeByPreference = (preference: Exclude<FeePreference, "custom">) => {
      return changeByPercentage(baseFee, this.#defaultPresetByPreference.baseFee[preference]);
    };

    this.#feeSettings = {
      low: getPreset(maxPriorityFeePerGasMap.low, "low"),
      medium: getPreset(maxPriorityFeePerGasMap.medium, "medium"),
      high: getPreset(maxPriorityFeePerGasMap.high, "high"),
      custom: this.#feeSettings?.custom ?? null,
    };
  }

  async updateFees() {
    try {
      const block = await this.#signer.provider.getBlock("latest");

      if (block.number === this.#blockNumber) return;

      await this.#configureFees(block);

      this.#blockNumber = block.number;
    } catch (error) {
      console.error("Failed to update fees for EIP1559 transaction", error);
    }
  }

  changeFeePreference(preference: FeePreference) {
    if (!preference || preference === this.#selectedFeePreference || preference === "custom") return;

    this.#selectedFeePreference = preference;
  }

  changeBaseFee(value: string) {
    if (!this.currentFeeSettings || !this.#feeSettings) return;

    try {
      const baseFee = parseUnits(value, "gwei");

      this.#feeSettings.custom = {
        ...this.currentFeeSettings,
        baseFee,
        maxFeePerGas: this.#calculateMaxFeePerGas(baseFee, this.currentFeeSettings.maxPriorityFeePerGas),
      };

      this.#selectedFeePreference = "custom";
    } catch (error) {
      console.error("Can not update base fee", error);
    }
  }

  changeMaxPriorityFeePerGas(value: string) {
    if (!this.currentFeeSettings || !this.#feeSettings) return;

    try {
      const maxPriorityFeePerGas = parseUnits(value, "gwei");

      this.#feeSettings.custom = {
        ...this.currentFeeSettings,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: this.#calculateMaxFeePerGas(this.currentFeeSettings.baseFee, maxPriorityFeePerGas),
      };

      this.#selectedFeePreference = "custom";
    } catch (error) {
      console.error("Can not update max priority fee per gas", error);
    }
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
    throw new Error("Gas price is not supported in EIP1559");
  }

  #calculateMaxFeePerGas(baseFee: BigNumber, maxPriorityFeePerGas: BigNumber) {
    return baseFee.add(maxPriorityFeePerGas);
  }
}
