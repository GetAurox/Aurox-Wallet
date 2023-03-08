import { TransactionRequest } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";

import { RawTransaction } from "common/types";
import { EVMSignerPopup } from "ui/common/connections";

import { EVMFeeManager } from "./base";

import { EIP1559FeeManager } from "./EIP1559";
import { LegacyFeeManager } from "./Legacy";

export class EVMFeeService {
  #isConnected = false;
  #feeManager: EVMFeeManager | null = null;
  #feeUpdateTask: ReturnType<typeof setInterval> | null = null;

  /** Provides status of RPC connection */
  get isConnected() {
    return this.#isConnected;
  }

  /** Resolved fee manager depending on the transaction type */
  get feeManager() {
    return this.#feeManager;
  }

  /** Indicates that the task for updating fees is running */
  get isRefreshingFees() {
    return !!this.#feeUpdateTask;
  }

  /** Factory method which produces correct Fee manager based on the transaction type
   * @description Automatically starts the fee update task
   * @returns Instance of this class
   */
  protected async initialize(transaction: RawTransaction, signer: EVMSignerPopup) {
    if (this.#feeManager) {
      throw new Error("Fee service is already initialized");
    }

    const manager = await this.#resolveFeeManager(transaction, signer);

    if (!manager) {
      throw new Error("Failed to initialize fee manager");
    }

    this.#feeManager = manager;

    await this.scheduleFeeUpdate();

    return this;
  }

  async #resolveFeeManager(transaction: TransactionRequest, signer: EVMSignerPopup) {
    try {
      const block = await signer.provider.getBlock("latest");

      const isEIP1559 = BigNumber.isBigNumber(block.baseFeePerGas);

      this.#isConnected = true;

      if (isEIP1559) {
        return new EIP1559FeeManager(transaction, signer);
      }

      return new LegacyFeeManager(transaction, signer);
    } catch (error) {
      console.error("Can not get fee data for this transaction", error);

      this.#isConnected = false;

      return null;
    }
  }

  /** Aborts the fee update task */
  cancelFeeUpdate() {
    if (!this.#feeUpdateTask) return;

    clearInterval(this.#feeUpdateTask);
  }

  /** Starts the periodic fee update task */
  async scheduleFeeUpdate(frequency = 5000) {
    if (!this.#feeManager) {
      throw new Error("Fee service is not initialized");
    }

    if (this.isRefreshingFees) {
      throw new Error("Fee update job is already running");
    }

    await this.#feeManager.updateFees();

    const updateFee = async () => {
      if (!this.#feeManager) return;

      await this.#feeManager.updateFees();
    };

    this.#feeUpdateTask = setInterval(updateFee, frequency);
  }
}
