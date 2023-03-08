import { SecureEVMTransactionsState } from "common/states";
import { EVMTransactions, Wallet } from "common/operations";

import {
  WalletManager,
  NetworkManager,
  EVMTransactionsOperationManager,
  EVMTransactionsStorageManager,
  DAppOperationsManager,
} from "serviceWorker/managers";

export async function setupEVMTransactionsService(
  walletManager: WalletManager,
  networkManager: NetworkManager,
  dappOperationsManager: DAppOperationsManager,
) {
  const storageManager = await EVMTransactionsStorageManager.initialize(walletManager, networkManager);

  const operationManager = new EVMTransactionsOperationManager(walletManager, networkManager, storageManager, dappOperationsManager);

  const provider = SecureEVMTransactionsState.buildProvider({ evmTransactionsData: storageManager.getEVMTransactionsData() });

  storageManager.addListener("evm-transactions-updated", () => {
    provider.update(draft => {
      draft.evmTransactionsData = storageManager.getEVMTransactionsData();
    });
  });

  EVMTransactions.SendEVMTransaction.registerResponder(async ({ accountUUID, networkIdentifier, transaction, operationId, metadata }) => {
    return await operationManager.send(accountUUID, networkIdentifier, transaction, operationId, metadata);
  });

  EVMTransactions.SaveEVMTransactions.registerResponder(async ({ accountUUID, networkIdentifier, transactions }) => {
    await storageManager.saveEVMTransactions(accountUUID, networkIdentifier, transactions);
  });

  EVMTransactions.DeleteEVMTransactions.registerResponder(async ({ accountUUID, networkIdentifier, txHashes }) => {
    await storageManager.deleteEVMTransactions(accountUUID, networkIdentifier, txHashes);
  });

  EVMTransactions.UpdateEVMTransactionStatus.registerResponder(async ({ accountUUID, networkIdentifier, transactionHash, status }) => {
    await storageManager.updateEVMTransactionStatus(accountUUID, networkIdentifier, transactionHash, status);
  });

  Wallet.SignTypedDataV2.registerResponder(async ({ accountUUID, data, dappOperationId }) => {
    return await operationManager.signTypedData(accountUUID, data, dappOperationId);
  });

  Wallet.SignMessageV2.registerResponder(async ({ uuid, message, unsafeWithoutPrefix, dappOperationId }) => {
    return await operationManager.signMessage(uuid, message, unsafeWithoutPrefix, dappOperationId);
  });

  return { storageManager, operationManager, provider };
}
