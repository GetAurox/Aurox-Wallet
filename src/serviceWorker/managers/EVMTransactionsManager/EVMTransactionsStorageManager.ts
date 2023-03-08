import produce from "immer";
import drop from "lodash/drop";
import { TypedEmitter } from "tiny-typed-emitter";
import { TransactionReceipt, TransactionResponse } from "@ethersproject/abstract-provider";

import {
  EVM_TRANSACTIONS_RECEIPTS_SURVEY_INTERVAL,
  EVM_TRANSACTIONS_MAX_CACHED_PER_ACCOUNT,
  EVM_TRANSACTIONS_OLD_TRANSACTIONS_SURVEY_INTERVAL,
} from "common/config";

import { EVMTransactionEntry, EVMTransactions, EVMTransactionStatus } from "common/types";
import { loadEVMTransactionsDataFromLocalArea, saveEVMTransactionsDataToLocalArea } from "common/storage";
import { ProviderManager } from "common/wallet";
import { getTimeInMilliseconds } from "common/utils";

import { WalletManager } from "../WalletManager";
import { NetworkManager } from "../NetworkManager";

export interface EVMTransactionsStorageManagerEvents {
  "evm-transactions-updated": () => void;
}

export class EVMTransactionsStorageManager extends TypedEmitter<EVMTransactionsStorageManagerEvents> {
  #walletManager: WalletManager;
  #networkManager: NetworkManager;

  #evmTransactionsData: EVMTransactions;

  #receiptsSurveyIntervalId: any;
  #oldTransactionsExpirationSurveyIntervalId: any;

  private constructor(walletManager: WalletManager, networkManager: NetworkManager, evmTransactionsDataFromStorage: EVMTransactions) {
    super();

    this.#walletManager = walletManager;
    this.#networkManager = networkManager;
    this.#evmTransactionsData = evmTransactionsDataFromStorage;

    this.#initializeReceiptsSurvey();
    this.#initializeOldTransactionExpirationSurvey();
  }

  static async initialize(walletManager: WalletManager, networkManager: NetworkManager) {
    const evmTransactionsDataFromStorage = await loadEVMTransactionsDataFromLocalArea();

    return new this(walletManager, networkManager, evmTransactionsDataFromStorage || {});
  }

  getEVMTransactionsData() {
    return this.#evmTransactionsData;
  }

  async saveEVMTransactions(accountUUID: string, networkIdentifier: string, transactionEntries: EVMTransactionEntry[]) {
    this.#evmTransactionsData = produce(this.#evmTransactionsData, draft => {
      for (const transactionEntry of transactionEntries) {
        draft[this.#toIdentifier(accountUUID, networkIdentifier, transactionEntry.txHash)] = transactionEntry;
      }
    });

    await saveEVMTransactionsDataToLocalArea(this.#evmTransactionsData);

    this.emit("evm-transactions-updated");
  }

  async deleteEVMTransactions(accountUUID: string, networkIdentifier: string, txHashes: string[]) {
    this.#evmTransactionsData = produce(this.#evmTransactionsData, draft => {
      for (const txHash of txHashes) {
        delete draft[this.#toIdentifier(accountUUID, networkIdentifier, txHash)];
      }
    });

    await saveEVMTransactionsDataToLocalArea(this.#evmTransactionsData);

    this.emit("evm-transactions-updated");
  }

  async updateEVMTransactionStatus(accountUUID: string, networkIdentifier: string, txHash: string, status: EVMTransactionStatus) {
    const originalTransactionId = this.#toIdentifier(accountUUID, networkIdentifier, txHash);

    this.#evmTransactionsData = produce(this.#evmTransactionsData, draft => {
      draft[originalTransactionId].status = status;
    });

    await saveEVMTransactionsDataToLocalArea(this.#evmTransactionsData);

    this.emit("evm-transactions-updated");
  }

  // Intentionally using arrow function to preserve correct
  // `this` context reference to avoid context binding
  #processOldTransactionExpirationSurvey = async () => {
    if (!this.#walletManager.isUnlocked) {
      return;
    }

    const accountUUID = this.#walletManager.getActiveAccountUUID() ?? "";
    const transactionsOfAccount: EVMTransactionEntry[] = [];

    // Collect transactions that belong to `accountUUID`
    for (const [identifier, transactionEntry] of Object.entries(this.#evmTransactionsData)) {
      const [targetAccountUUID] = this.#fromIdentifier(identifier);

      // Ignore transactions for other accounts
      if (targetAccountUUID !== accountUUID) {
        continue;
      }

      transactionsOfAccount.push(transactionEntry);
    }

    // Break if cached transactions amount is less than `MAX`
    if (transactionsOfAccount.length <= EVM_TRANSACTIONS_MAX_CACHED_PER_ACCOUNT) {
      return;
    }

    // Omitting first most recent `MAX` account transactions
    // from deletion and deleting the rest old transactions
    const oldTransactions = drop(
      transactionsOfAccount.sort((a, b) => b.timestamp - a.timestamp),
      EVM_TRANSACTIONS_MAX_CACHED_PER_ACCOUNT,
    );

    this.#evmTransactionsData = produce(this.#evmTransactionsData, draft => {
      for (const oldTransaction of oldTransactions) {
        delete draft[this.#toIdentifier(oldTransaction.accountUUID, oldTransaction.networkIdentifier, oldTransaction.txHash)];
      }
    });

    await saveEVMTransactionsDataToLocalArea(this.#evmTransactionsData);

    this.emit("evm-transactions-updated");
  };

  #initializeOldTransactionExpirationSurvey() {
    if (this.#oldTransactionsExpirationSurveyIntervalId) {
      clearInterval(this.#oldTransactionsExpirationSurveyIntervalId);
    }

    this.#processOldTransactionExpirationSurvey();

    this.#oldTransactionsExpirationSurveyIntervalId = setInterval(
      this.#processOldTransactionExpirationSurvey,
      EVM_TRANSACTIONS_OLD_TRANSACTIONS_SURVEY_INTERVAL,
    );
  }

  // Intentionally using arrow function to preserve correct
  // `this` context reference to avoid context binding
  #processReceiptsSurvey = async () => {
    if (!this.#walletManager.isUnlocked) {
      return;
    }

    const accountUUID = this.#walletManager.getActiveAccountUUID() ?? "";

    const txCandidatesForSurvey: {
      txHash: string;
      networkIdentifier: string;
    }[] = [];
    const txReceiptsSurveyQueue: (Promise<TransactionReceipt> | void)[] = [];
    const txResponseQueue: (Promise<TransactionResponse> | void)[] = [];

    for (const [identifier, transactionEntry] of Object.entries(this.#evmTransactionsData)) {
      const [targetAccountUUID, targetNetworkIdentifier, targetTransactionHash] = this.#fromIdentifier(identifier);

      // Ignore transactions for other accounts
      if (targetAccountUUID !== accountUUID) {
        continue;
      }

      if (transactionEntry.status === EVMTransactionStatus.Pending) {
        const network = this.#networkManager.getNetworkByIdentifier(targetNetworkIdentifier);

        if (network) {
          const provider = ProviderManager.getProvider(network);

          txCandidatesForSurvey.push({ txHash: targetTransactionHash, networkIdentifier: network.identifier });
          txResponseQueue.push(provider.getTransaction(targetTransactionHash));
          txReceiptsSurveyQueue.push(provider.getTransactionReceipt(targetTransactionHash));
        }
      }
    }

    if (txReceiptsSurveyQueue.length === 0) {
      return;
    }

    const txResponsesResult = await Promise.allSettled(txResponseQueue);
    const txReceiptsSurveyResults = await Promise.allSettled(txReceiptsSurveyQueue);

    let hasNewReceipts = false;
    let hasCorruptedTransactions = false;

    this.#evmTransactionsData = produce(this.#evmTransactionsData, draft => {
      for (let index = 0; index < txReceiptsSurveyResults.length; index += 1) {
        const txHash = txCandidatesForSurvey[index].txHash;
        const networkIdentifier = txCandidatesForSurvey[index].networkIdentifier;
        const receiptResult = txReceiptsSurveyResults[index];
        const transactionResult = txResponsesResult[index];

        const identifier = this.#toIdentifier(accountUUID, networkIdentifier, txHash);

        if (transactionResult.status === "fulfilled" && !transactionResult.value) {
          // Gives node some time to pick up the transaction
          const allowedTimeBuffer = draft[identifier].timestamp + getTimeInMilliseconds({ unit: "minute", amount: 10 }) / 1000;

          if (Date.now() / 1000 > allowedTimeBuffer) {
            delete draft[identifier];

            hasCorruptedTransactions = true;

            continue;
          }
        }

        if (receiptResult.status === "fulfilled") {
          // Expect tx receipt object here
          if (receiptResult.value) {
            hasNewReceipts = true;

            draft[identifier].receipt = receiptResult.value;
            draft[identifier].status = receiptResult.value?.status === 1 ? EVMTransactionStatus.Completed : EVMTransactionStatus.Failed;
          }

          continue;
        }

        console.error(`Failed to get receipt for "${txHash}" through RPC call. Reason:`, receiptResult.reason);
      }
    });

    if (!hasNewReceipts && !hasCorruptedTransactions) {
      return;
    }

    await saveEVMTransactionsDataToLocalArea(this.#evmTransactionsData);

    this.emit("evm-transactions-updated");
  };

  #initializeReceiptsSurvey() {
    if (this.#receiptsSurveyIntervalId) {
      clearInterval(this.#receiptsSurveyIntervalId);
    }

    this.#processReceiptsSurvey();

    this.#receiptsSurveyIntervalId = setInterval(this.#processReceiptsSurvey, EVM_TRANSACTIONS_RECEIPTS_SURVEY_INTERVAL);
  }

  #toIdentifier(accountUUID: string, networkIdentifier: string, txHash: string) {
    return `${accountUUID}||${networkIdentifier}||${txHash}`;
  }

  #fromIdentifier(identifier: string) {
    return identifier.split("||");
  }
}
