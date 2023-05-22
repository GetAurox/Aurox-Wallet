import pick from "lodash/pick";
import omit from "lodash/omit";

import Decimal from "decimal.js";
import { BigNumber, constants, ethers } from "ethers";
import { formatEther, hexlify, parseUnits } from "ethers/lib/utils";
import { Block, TransactionRequest } from "@ethersproject/abstract-provider";

import { Matrix } from "common/utils";
import { parseEthersRPCError } from "common/errors";
import { JsonRPCProviderWithRetry } from "common/wallet";

import { GasPresetSettings } from "ui/types";

import { EVMFeePreference as FeePreference, TransactionType } from "../types";

import { EVMFeeManagerInterface } from "../base";

import { changeByPercentage, getMedian, humanizeValue } from "../utils";

import { defaultPriorityFees, MINIMUM_GAS_LIMIT } from "../constants";

import { FeeSettings, FeeConfigurationEIP1559, FeeHistory, MaxPriorityFeePerGasMap } from "./types";

export class EIP1559FeeManager implements EVMFeeManagerInterface<FeeConfigurationEIP1559<BigNumber>> {
  #feeSettings: FeeSettings<BigNumber> | null = null;
  #selectedFeePreference: FeePreference = "medium";
  #transaction: TransactionRequest;
  #provider: JsonRPCProviderWithRetry;
  #gasPresets?: GasPresetSettings;

  #blockNumber = 0;
  #userBalance = constants.Zero;

  #error: string | null = null;
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

  get currentFeeSettings(): FeeConfigurationEIP1559<BigNumber> | null {
    if (!this.#feeSettings) return null;

    return this.#feeSettings[this.#selectedFeePreference];
  }

  get transaction(): TransactionRequest {
    return omit(
      {
        ...this.#transaction,
        ...this.feeSettingsForEthereum,
        chainId: this.#provider.network.chainId,
        type: TransactionType.EIP1559,
      },
      "baseFee",
    );
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

    return this.#userBalance.gte(price.add(this.transactionValue));
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
    try {
      if (!this.#gasEstimate || this.#gasEstimate.eq(0)) {
        this.#gasEstimate = await this.#provider.estimateGas(this.#transaction);

        this.#error = null;
      }
    } catch (error) {
      this.#error = parseEthersRPCError(error);

      this.#gasEstimate = null;
    }
  }

  async #getHistoricalRewards(numberOfBlocksToTake: number | string, percentiles = [25, 50, 75]): Promise<string[][]> {
    let feeHistory: FeeHistory | undefined;

    try {
      feeHistory = await this.#provider.send("eth_feeHistory", [numberOfBlocksToTake, "latest", percentiles]);
    } catch (error) {
      console.error(`Failed to get 'eth_feeHistory', for ${numberOfBlocksToTake} blocks on chain: "${this.#provider.network.name}"`, error);
    }

    if (!feeHistory?.reward && typeof numberOfBlocksToTake === "number") {
      return this.#getHistoricalRewards(hexlify(numberOfBlocksToTake));
    }

    return feeHistory?.reward || [defaultPriorityFees.map(String)];
  }

  async #configureFees(block: Block) {
    if (!block.baseFeePerGas) {
      throw new Error("Failed to get the base fee from the block. Possible that the chain is not EIP1559 compliant");
    }

    const [, maxPriorityFeePerGasMap] = await Promise.all([this.#estimateGas(), this.#maxPriorityFeePerGasMap(block.number)]);

    this.#configureFeesByPreference(block.baseFeePerGas, maxPriorityFeePerGasMap);
  }

  async #maxPriorityFeePerGasMap(blockNumber: number, defaultBlockCount = 4): Promise<MaxPriorityFeePerGasMap> {
    const blockDifference = blockNumber - this.#blockNumber;

    if (blockDifference !== 0) {
      const numberOfBlocksToTake = blockDifference < defaultBlockCount ? blockDifference : defaultBlockCount;

      const reward = await this.#getHistoricalRewards(numberOfBlocksToTake);

      const rewardMatrix = new Matrix(reward);

      this.#maxPriorityFeePerGasHistory.slice(numberOfBlocksToTake).join(rewardMatrix);
    }

    // TODO: Use common utils for this once available
    const toDecimal = (value: string) => new Decimal(value);

    const newMaxPriorityFeePerGas = this.#maxPriorityFeePerGasHistory.apply(toDecimal).transpose().toArray();

    const [low, medium, high] = newMaxPriorityFeePerGas.map(getMedian).map(value => BigNumber.from(value.toFixed(0)));

    return { low, medium, high };
  }

  #configureFeesByPreference(baseFee: BigNumber, maxPriorityFeePerGasMap: any) {
    const gasLimit = this.#gasEstimate || this.currentFeeSettings?.gasLimit || BigNumber.from(0);

    const getPreset = (
      maxPriorityFeePerGas: BigNumber,
      preference: Exclude<FeePreference, "custom">,
    ): FeeConfigurationEIP1559<BigNumber> => {
      const presetsEnabled = this.#gasPresets?.enabled ?? false;

      const preferenceGasPresets = this.#gasPresets?.[preference] ?? {};

      const gasLimitPresetEnabled = presetsEnabled && preferenceGasPresets.gasLimit !== undefined && !gasLimit.eq(MINIMUM_GAS_LIMIT);
      const baseFeePresetEnabled = presetsEnabled && preferenceGasPresets.baseFee !== undefined;
      const maxPriorityFeePerGasPresetEnabled = presetsEnabled && preferenceGasPresets.priorityFee !== undefined;

      const maxPriorityFeePerGasPreset = ethers.utils.parseUnits(preferenceGasPresets.priorityFee ?? "0", "gwei");

      const baseFeePresetPrecentage = new Decimal(preferenceGasPresets.baseFee ?? "0").toNumber();
      const gasLimitPresetPrecentage = new Decimal(preferenceGasPresets.gasLimit ?? "0").toNumber();

      const baseFeeValue = baseFeePresetEnabled ? changeByPercentage(baseFee, baseFeePresetPrecentage) : getBaseFeeByPreference(preference);
      const gasLimitValue = gasLimitPresetEnabled
        ? changeByPercentage(gasLimit, gasLimitPresetPrecentage)
        : getGasLimitByPreference(preference);
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
      const block = await this.#provider.getBlock("latest");

      if (block.number === this.#blockNumber) return;

      await this.#configureFees(block);

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
    throw new Error("Gas price is not supported in EIP1559");
  }

  #calculateMaxFeePerGas(baseFee: BigNumber, maxPriorityFeePerGas: BigNumber) {
    return baseFee.add(maxPriorityFeePerGas);
  }
}
