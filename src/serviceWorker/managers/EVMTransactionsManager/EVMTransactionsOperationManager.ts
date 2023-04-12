import { TypedEmitter } from "tiny-typed-emitter";

import { loadNonceFromSyncArea, saveNonceToSyncArea } from "common/storage";
import {
  AccountInfo,
  EVMTransactionStatus,
  HardwareOperation,
  SignTypedDataPayload,
  TransactionRequest,
  SendTransactionMetadata,
} from "common/types";
import { EVMProvider, JsonRPCProviderWithRetry, ProviderManager } from "common/wallet";
import { HARDWARE_URL } from "common/entities";

import { SecureHardwareState } from "common/states";
import { Hardware as HardwareEvents } from "common/events";

import { NetworkManager } from "../NetworkManager";
import { WalletManager } from "../WalletManager";

import { DAppOperationsManager } from "../DAppProviderManager";

import { EVMTransactionsStorageManager as StorageManager } from "./EVMTransactionsStorageManager";

export interface EVMTransactionsOperationManagerEvents {
  "evm-transaction-confirmed": (data: { title: string; message: string; blockExplorerURL: string | null }) => void;
}

export class EVMTransactionsOperationManager extends TypedEmitter<EVMTransactionsOperationManagerEvents> {
  #walletManager: WalletManager;
  #networkManager: NetworkManager;
  #storageManager: StorageManager;
  #dappOperationsManager: DAppOperationsManager;

  #hardwareWindowId: number | null = null;

  constructor(
    walletManager: WalletManager,
    networkManager: NetworkManager,
    storageManager: StorageManager,
    dappOperationsManager: DAppOperationsManager,
  ) {
    super();

    this.#walletManager = walletManager;
    this.#networkManager = networkManager;
    this.#storageManager = storageManager;
    this.#dappOperationsManager = dappOperationsManager;
  }

  async send(
    accountUUID: string,
    networkIdentifier: string,
    transaction: TransactionRequest,
    dappOperationId?: string,
    metadata?: SendTransactionMetadata,
  ) {
    const account = this.#walletManager.getAllAccountInfo().find(account => account.uuid === accountUUID);

    if (!account) {
      throw new Error("Account not found for provided id");
    }

    const network = this.#networkManager.getNetworkByIdentifier(networkIdentifier);

    if (!network) {
      throw new Error(`Network with ${networkIdentifier} is not found`);
    }

    const nonce = await this.#getNonce(accountUUID, networkIdentifier);

    const saveNonceOnComplete = !transaction.nonce || transaction.nonce >= nonce;

    if (saveNonceOnComplete) {
      transaction.nonce = nonce;
    }

    if (!transaction.value) {
      transaction.value = "0x0";
    }

    transaction.chainId = network.chainId;

    const { provider } = ProviderManager.getProvider(network) as EVMProvider;

    try {
      const signedTransaction = await this.signTransaction(account, transaction, dappOperationId);

      const response = await provider.sendTransaction(signedTransaction);

      if (!response) {
        // This is a safeguard, response should not be null, ever, but if it is, we should raise an error
        throw new Error(`Unknown error occured, failed to get transaction response`);
      }

      response.wait(1).then(() => {
        this.emit("evm-transaction-confirmed", {
          title: metadata?.title ?? "Confirmed",
          message: `${metadata?.message ?? "Transaction"} confirmed`,
          blockExplorerURL: metadata?.blockExplorerTxBaseURL ? `${metadata.blockExplorerTxBaseURL}${response.hash}` : null,
        });
      });

      this.#storageManager.saveEVMTransactions(accountUUID, networkIdentifier, [
        {
          networkIdentifier,
          accountUUID,
          status: EVMTransactionStatus.Pending,
          transaction: response,
          timestamp: Math.round(Date.now() / 1000),
          txHash: response.hash,
        },
      ]);

      if (saveNonceOnComplete) {
        this.#saveNonce(accountUUID, networkIdentifier, transaction.nonce + 1);
      }

      return response;
    } catch (error) {
      throw new Error(error);
    }
  }

  async signTransaction(account: AccountInfo, transaction: TransactionRequest, dappOperationId?: string) {
    // If Mnemonic or Private-Key types get the Service Worker to sign
    if (account.type === "mnemonic" || account.type === "private-key") {
      return await this.#walletManager.signTransaction("evm", account.uuid, { type: "evm", params: transaction });
    }

    return await this.#signWithHardware({
      accountUUID: account.uuid,
      operationType: "signTransaction",
      device: account.hardwareType,
      transaction,
      dappOperationId,
    });
  }

  async signMessage(accountUUID: string, message: string, unsafeWithoutPrefix = false, dappOperationId?: string) {
    const account = this.#walletManager.getAllAccountInfo().find(account => account.uuid === accountUUID);

    if (!account) {
      throw new Error("Can not find account with that id");
    }

    if (account.type === "mnemonic" || account.type === "private-key") {
      return await this.#walletManager.signMessage({ chainType: "evm", message, uuid: account.uuid, unsafeWithoutPrefix });
    }

    return await this.#signWithHardware({
      accountUUID: account.uuid,
      operationType: "signMessage",
      device: account.hardwareType,
      message,
      dappOperationId,
    });
  }

  async signTypedData(accountUUID: string, typedData: SignTypedDataPayload, dappOperationId?: string) {
    const account = this.#walletManager.getAllAccountInfo().find(account => account.uuid === accountUUID);

    if (!account) {
      throw new Error("Can not find account with that id");
    }

    if (account.type === "mnemonic" || account.type === "private-key") {
      return await this.#walletManager.signTypedData(account.uuid, typedData);
    }

    return await this.#signWithHardware({
      accountUUID: account.uuid,
      operationType: "signTypedData",
      device: account.hardwareType,
      typedData,
      dappOperationId,
    });
  }

  async #signWithHardware(operation: HardwareOperation) {
    if (!this.#hardwareWindowId) {
      const { id: windowId } = await chrome.windows.create({
        type: "popup",
        url: HARDWARE_URL,
        focused: true,
        width: 360,
        height: 300,
      });

      this.#hardwareWindowId = windowId ?? null;
    }

    const provider = SecureHardwareState.buildProvider({ operation });

    const dappOperationAbortHandler = async (operationId: string) => {
      if (operationId === operation.dappOperationId) {
        await provider.update(draft => {
          if (draft.operation && !draft.operation.cancelled) {
            draft.operation = { ...draft.operation, cancelled: true };
          }
        });
      }
    };

    this.#dappOperationsManager.on("operation-aborted", dappOperationAbortHandler);

    return new Promise<string>((resolve, reject) => {
      const removeListener = HardwareEvents.Message.addListener(async data => {
        if (data.success && data.result) {
          resolve(data.result);
        } else {
          reject(data.error ?? "Unknown hardware error");
        }

        provider.destroy();

        removeListener();

        this.#dappOperationsManager.removeListener("operation-aborted", dappOperationAbortHandler);

        if (typeof this.#hardwareWindowId === "number") {
          chrome.windows.remove(this.#hardwareWindowId);

          this.#hardwareWindowId = null;
        }
      });

      const hardwarePopupRemovalHandler = (windowId: number | null) => {
        if (windowId === this.#hardwareWindowId) {
          reject("User closed the connector");

          provider.destroy();

          this.#hardwareWindowId = null;

          chrome.windows.onRemoved.removeListener(hardwarePopupRemovalHandler);
        }
      };

      chrome.windows.onRemoved.addListener(hardwarePopupRemovalHandler);
    });
  }

  async #saveNonce(accountUUID: string, networkIdentifier: string, nonce: number) {
    await saveNonceToSyncArea(accountUUID, networkIdentifier, nonce);
  }

  async #getNonce(accountUUID: string, networkIdentifier: string): Promise<number> {
    const network = this.#networkManager.getNetworkByIdentifier(networkIdentifier);

    if (!network) {
      throw new Error(`Network with ${networkIdentifier} is not found`);
    }

    const accountAddress = this.#walletManager.getAddress(accountUUID, "evm");

    if (!accountAddress) {
      throw new Error(`Can not find account with id: ${accountUUID}`);
    }

    let rpcNonce = 0;

    try {
      const provider = new JsonRPCProviderWithRetry(network);

      rpcNonce = await provider.getTransactionCount(accountAddress);
    } catch (error) {
      console.error(error);
    }

    const cachedNonce = await loadNonceFromSyncArea(accountUUID, networkIdentifier);

    if (!cachedNonce || rpcNonce > cachedNonce) {
      return rpcNonce;
    }

    return cachedNonce;
  }
}
