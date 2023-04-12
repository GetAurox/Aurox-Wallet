import { TransactionResponse } from "@ethersproject/abstract-provider";
import { EVMTransactions } from "common/operations";
import { EVMTransactionStatus, RawTransaction, TransactionRequest, SendTransactionMetadata } from "common/types";
import { GasPresetSettings } from "ui/types";

import { EVMSignerPopup } from "../connections";
import { EVMFeeService } from "../fee";

// NOTE: Replacing hook logic under src/ui/hooks/transactions/useTransactionFees
export class EVMTransactionManager extends EVMFeeService {
  #transactionResponse: TransactionResponse | null = null;
  #transactionStatus = EVMTransactionStatus.Created;
  #nonce: number | null = null;

  #transaction: RawTransaction;
  #isInitialized = false;

  #signer: EVMSignerPopup;

  constructor(transaction: RawTransaction, signer: EVMSignerPopup) {
    super();

    this.#transaction = transaction;
    this.#signer = signer;
  }

  /** Initializes the fee manager and determines the transaction type
   * @note Builder method
   */
  async withFees(gasPresets?: GasPresetSettings): Promise<this> {
    if (this.#isInitialized) {
      throw new Error("Transaction manager is already initialized");
    }

    await super.initialize(this.#transaction, this.#signer, gasPresets);

    this.#isInitialized = true;

    return this;
  }

  /** Force the transaction to use the provided nonce
   * instead of an auto-generated one
   * @param nonce - Nonce to be sent with the transaction
   * */
  overrideNonce(nonce: number) {
    this.#nonce = nonce;
  }

  get transactionHash() {
    return this.#transactionResponse?.hash ?? null;
  }

  async sendTransaction(operationId?: string, metadata?: SendTransactionMetadata) {
    this.cancelFeeUpdate();

    // All of these are service worker related
    const { hash } = await this.#sendTransaction(operationId, metadata);

    return hash;
  }

  async getTransactionStatus() {
    if (this.#transactionStatus !== EVMTransactionStatus.Pending) {
      return this.#transactionStatus;
    }

    try {
      const receipt = await this.#signer.provider.getTransactionReceipt(this.#transactionResponse?.hash ?? "");

      if (!receipt) {
        this.#transactionStatus = EVMTransactionStatus.Pending;
      }

      if (receipt.status === EVMTransactionStatus.Failed) {
        this.#transactionStatus = EVMTransactionStatus.Failed;
      }

      if (receipt.status === EVMTransactionStatus.Completed) {
        this.#transactionStatus = EVMTransactionStatus.Completed;
      }

      return this.#transactionStatus;
    } catch (error) {
      console.error("Unable to get transaction status at this time", error);

      return this.#transactionStatus;
    }
  }

  async #sendTransaction(operationId?: string, metadata?: SendTransactionMetadata) {
    if (!this.isConnected || !this.feeManager) {
      throw new Error("Can not connect to the RPC node");
    }

    try {
      const transaction = this.feeManager.transaction;

      if (this.#nonce) {
        transaction.nonce = this.#nonce;
      }

      const response = await EVMTransactions.SendEVMTransaction.perform({
        accountUUID: this.#signer.accountInfo.uuid,
        networkIdentifier: this.#signer.networkIdentifier,
        transaction: transaction as TransactionRequest,
        operationId,
        metadata,
      });

      this.#transactionStatus = EVMTransactionStatus.Pending;

      this.#transactionResponse = response;

      return response;
    } catch (error) {
      if (error.message) {
        throw error.message;
      }

      throw error;
    }
  }
}
