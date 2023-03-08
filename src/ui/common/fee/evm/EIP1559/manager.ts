import { BigNumber, constants } from "ethers";
import { Deferrable, formatEther, parseUnits } from "ethers/lib/utils";
import { Block, TransactionRequest } from "@ethersproject/abstract-provider";

import pick from "lodash/pick";

import { EVMSignerPopup } from "ui/common/connections";

import { Matrix } from "common/utils";

import { EVMFeePreference as FeePreference, TransactionType } from "../types";

import { EVMFeeManagerInterface } from "../base";

import { getMedian, humanizeValue, roundBigNumberToDecimals } from "../utils";

import { FeeSettings, FeeConfigurationEIP1559, FeeHistory, MaxPriorityFeePerGasMap } from "./types";

export class EIP1559FeeManager implements EVMFeeManagerInterface<FeeConfigurationEIP1559<BigNumber>> {
  #feeSettings: FeeSettings<BigNumber> | null = null;
  #selectedFeePreference: FeePreference = "medium";
  #transaction: TransactionRequest;
  #signer: EVMSignerPopup;

  #blockNumber = 0;
  #userBalance = constants.Zero;

  // This indicates that the chain supports EIP1559,
  // however they do not comply entirely with EIP1559 standards
  #isCustomEIP1559: boolean | null = null;

  #gasEstimate: BigNumber | null = null;
  #maxPriorityFeePerGasHistory = new Matrix<string>([]);

  constructor(transaction: TransactionRequest, signer: EVMSignerPopup) {
    this.#signer = signer;
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

  get feePriceInNativeCurrency() {
    if (!this.currentFeeSettings) return null;

    const { maxFeePerGas, gasLimit } = this.currentFeeSettings;

    const price = formatEther(maxFeePerGas.mul(gasLimit));

    return Number(parseFloat(price).toPrecision(6));
  }

  async #estimateGas() {
    if (!this.#gasEstimate) {
      this.#gasEstimate = await this.#signer.estimateGas(this.#transaction);
    }

    return this.#gasEstimate;
  }

  async #getFeeHistory(numberOfBlocksToTake: number, percentiles = [25, 50, 75]) {
    return (await this.#signer.provider.send("eth_feeHistory", [numberOfBlocksToTake, "latest", percentiles])) as FeeHistory;
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

    const correctionFactor = maxPriorityFeePerGas.div(4);

    return [
      maxPriorityFeePerGas.toHexString(),
      maxPriorityFeePerGas.add(correctionFactor).toHexString(),
      maxPriorityFeePerGas.add(correctionFactor.mul(2)).toHexString(),
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
    gasLimit = gasLimit.add(gasLimit.div(2));

    const getPreset = (maxPriorityFeePerGas: BigNumber): FeeConfigurationEIP1559<BigNumber> => ({
      type: TransactionType.EIP1559,
      gasLimit: gasLimit,
      maxFeePerGas: this.#calculateMaxFeePerGas(baseFee, maxPriorityFeePerGas),
      maxPriorityFeePerGas,
      baseFee,
    });

    this.#feeSettings = {
      low: getPreset(maxPriorityFeePerGasMap.low),
      medium: getPreset(maxPriorityFeePerGasMap.medium),
      high: getPreset(maxPriorityFeePerGasMap.high),
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
    return baseFee.mul(2).add(maxPriorityFeePerGas);
  }
}
