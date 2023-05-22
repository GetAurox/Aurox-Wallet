import axios from "axios";
import { ethers } from "ethers";
import { TypedEmitter } from "tiny-typed-emitter";

import { GASLESS_SERVICE_URL } from "common/config";
import { getTimeInMilliseconds } from "common/utils";
import { getRPCErrorMessage, parseGaslessError } from "common/wallet";
import { EVMTransactionStatus, TransactionRequest } from "common/types";

import { WalletManager } from "../WalletManager";

import { EVMTransactionsOperationManager } from "./EVMTransactionsOperationManager";
import { EVMTransactionsStorageManager } from "./EVMTransactionsStorageManager";

type BundleStatus = "STARTED" | "PENDING" | "COMPLETED" | "FAILED";
type GaslessJobResult = { status: BundleStatus; message: string };

export interface GaslessManagerEvents {
  "approval-signed": () => void;
  "swap-signed": () => void;
  "gasless-completed": (gaslessTransactionHash: string) => void;
}

export class EVMTransactionsGaslessManager extends TypedEmitter<GaslessManagerEvents> {
  #operationManager: EVMTransactionsOperationManager;
  #storageManager: EVMTransactionsStorageManager;
  #walletManager: WalletManager;

  #gaslessServiceClient = axios.create({
    baseURL: GASLESS_SERVICE_URL,
  });

  constructor(
    operationManager: EVMTransactionsOperationManager,
    storageManager: EVMTransactionsStorageManager,
    walletManager: WalletManager,
  ) {
    super();

    this.#operationManager = operationManager;
    this.#storageManager = storageManager;
    this.#walletManager = walletManager;
  }

  async #sendRequest(accountAddress: string, signedSwapTransaction: string, signedApprovalTransaction?: string) {
    try {
      return await this.#gaslessServiceClient.post<{ jobId: string }>("/gasless-swap", {
        from: accountAddress,
        approvalTx: signedApprovalTransaction,
        swapProxyTx: signedSwapTransaction,
        timeoutInUnix: Math.floor(Date.now() / 1000) + getTimeInMilliseconds({ unit: "minute", amount: 5 }),
      });
    } catch (error) {
      const message = parseGaslessError(error) ?? getRPCErrorMessage(error);

      throw new Error(message ?? "Unknown error from gasless service");
    }
  }

  async #saveTransaction(accountUUID: string, networkIdentifier: string, transaction: TransactionRequest, signedTransaction: string) {
    const { hash } = ethers.utils.parseTransaction(signedTransaction);

    await this.#storageManager.saveEVMTransactions(accountUUID, networkIdentifier, [
      {
        networkIdentifier,
        accountUUID,
        status: EVMTransactionStatus.Pending,
        transaction: { ...transaction, hash: hash as string },
        timestamp: Math.round(Date.now() / 1000),
        txHash: hash as string,
        gasless: true,
      },
    ]);

    return hash;
  }

  #getBundleStatus = (jobId: string): Promise<EVMTransactionStatus> => {
    return new Promise(resolve => {
      let attempts = 12 * 6;

      const handler = async () => {
        const statusResponse = await this.#gaslessServiceClient.get<GaslessJobResult>(`/job/${jobId}`);

        if (statusResponse.data.status === "COMPLETED" || statusResponse.data.status === "FAILED") {
          resolve(
            {
              "COMPLETED": EVMTransactionStatus.Completed,
              "FAILED": EVMTransactionStatus.Failed,
            }[statusResponse.data.status],
          );

          return;
        }

        attempts--;

        if (attempts > 0) {
          setTimeout(handler, 5000);
        } else {
          resolve(EVMTransactionStatus.Timeout);

          return;
        }
      };

      handler();
    });
  };

  async #handleStatusUpdate(accountUUID: string, networkIdentifier: string, jobId: string, swapHash: string, approvalHash?: string) {
    try {
      const status = await this.#getBundleStatus(jobId);

      await this.#storageManager.updateEVMTransactionStatus(accountUUID, networkIdentifier, swapHash, status);

      if (approvalHash) {
        await this.#storageManager.updateEVMTransactionStatus(accountUUID, networkIdentifier, approvalHash, status);
      }
    } catch (error) {
      console.error("Failed to retrieve bundle status from flashbots", error);
    }
  }

  async perform(
    accountUUID: string,
    networkIdentifier: string,
    swapTransaction: TransactionRequest,
    approvalTransaction?: TransactionRequest,
  ) {
    const accountAddress = this.#walletManager.getAddress(accountUUID, "evm");

    if (!accountAddress) {
      throw new Error("Can not find account address for provided uuid");
    }

    const nonce = await this.#operationManager.getNonce(accountUUID, networkIdentifier);

    if (approvalTransaction) {
      approvalTransaction.nonce = nonce;
    }

    const signedApprovalTransaction = approvalTransaction
      ? await this.#operationManager.signTransaction(accountUUID, networkIdentifier, { ...approvalTransaction, nonce })
      : undefined;

    if (signedApprovalTransaction) {
      this.emit("approval-signed");
    }

    swapTransaction.nonce = approvalTransaction ? nonce + 1 : nonce;

    const signedSwapTransaction = await this.#operationManager.signTransaction(accountUUID, networkIdentifier, swapTransaction);

    this.emit("swap-signed");

    const response = await this.#sendRequest(accountAddress, signedSwapTransaction, signedApprovalTransaction);

    if (response.status !== 202) {
      throw new Error("Request to gasless service failed");
    }

    let approvalHash: string | undefined;

    if (signedApprovalTransaction && approvalTransaction) {
      approvalHash = await this.#saveTransaction(accountUUID, networkIdentifier, approvalTransaction, signedApprovalTransaction);
    }

    const gaslessTransactionHash = await this.#saveTransaction(accountUUID, networkIdentifier, swapTransaction, signedSwapTransaction);

    this.#operationManager.saveNonce(accountUUID, networkIdentifier, nonce + 1);

    this.emit("gasless-completed", gaslessTransactionHash!);

    this.#handleStatusUpdate(accountUUID, networkIdentifier, response.data.jobId, gaslessTransactionHash!, approvalHash);

    return gaslessTransactionHash!;
  }
}
