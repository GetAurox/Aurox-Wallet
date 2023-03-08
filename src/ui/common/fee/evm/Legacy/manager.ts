import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber, constants } from "ethers";
import { Deferrable, formatEther, formatUnits, parseUnits } from "ethers/lib/utils";

import pick from "lodash/pick";

import { EVMSignerPopup } from "ui/common/connections";

import { EVMFeeManagerInterface } from "../base";

import { EVMFeePreference as FeePreference, TransactionType } from "../types";

import { FeeConfigurationLegacy, FeeSettings } from "./types";

export class LegacyFeeManager implements EVMFeeManagerInterface<FeeConfigurationLegacy<BigNumber>> {
  #feeSettings: FeeSettings<BigNumber> | null = null;
  #selectedFeePreference: FeePreference = "medium";
  #transaction: TransactionRequest;
  #signer: EVMSignerPopup;

  #blockNumber = 0;
  #userBalance = constants.Zero;

  constructor(transaction: TransactionRequest, signer: EVMSignerPopup) {
    this.#signer = signer;
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

  get feePriceInNativeCurrency() {
    if (!this.currentFeeSettings) return null;

    const { gasLimit, gasPrice } = this.currentFeeSettings;

    const price = formatEther(gasLimit.mul(gasPrice));

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
    const gasLimitWithBuffer = gasLimit.add(gasLimit.div(4));

    const getPreset = (gasPrice: BigNumber): FeeConfigurationLegacy<BigNumber> => ({
      type: TransactionType.Legacy,
      gasPrice,
      gasLimit: gasLimitWithBuffer,
    });

    this.#feeSettings = {
      low: getPreset(gasPrice),
      medium: getPreset(gasPrice.add(gasPrice.div(4))),
      high: getPreset(gasPrice.add(gasPrice.div(2))),
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
