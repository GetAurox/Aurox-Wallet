import { SecureEVMTransactionsState } from "common/states";
import { EVMTransactions, Wallet } from "common/operations";

import {
  WalletManager,
  NetworkManager,
  EVMTransactionsOperationManager,
  EVMTransactionsStorageManager,
  DAppOperationsManager,
  AlchemySimulator,
  BlockNativeSimulator,
} from "serviceWorker/managers";
import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config";

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

  EVMTransactions.SendEVMTransaction.registerResponder((request: EVMTransactions.SendEVMTransaction.Request) =>
    operationManager.send(request),
  );

  EVMTransactions.SaveEVMTransactions.registerResponder(({ accountUUID, networkIdentifier, transactions }) =>
    storageManager.saveEVMTransactions(accountUUID, networkIdentifier, transactions),
  );

  EVMTransactions.DeleteEVMTransactions.registerResponder(({ accountUUID, networkIdentifier, txHashes }) =>
    storageManager.deleteEVMTransactions(accountUUID, networkIdentifier, txHashes),
  );

  EVMTransactions.UpdateEVMTransactionStatus.registerResponder(({ accountUUID, networkIdentifier, transactionHash, status }) =>
    storageManager.updateEVMTransactionStatus(accountUUID, networkIdentifier, transactionHash, status),
  );

  EVMTransactions.SimulateEVMTransactions.registerResponder(async ({ simulator, transactions, chainId }) => {
    if (simulator === "alchemy") {
      return AlchemySimulator.simulate(transactions, chainId);
    }

    if (simulator === "blocknative" && chainId === ETHEREUM_MAINNET_CHAIN_ID) {
      return BlockNativeSimulator.simulate(transactions);
    }

    throw new Error(`Simulation can not be performed, got "${simulator}" for ${chainId}`);
  });

  Wallet.SignTypedDataV2.registerResponder(async ({ accountUUID, data, dappOperationId }) => {
    return await operationManager.signTypedData(accountUUID, data, dappOperationId);
  });

  Wallet.SignMessageV2.registerResponder(async ({ uuid, message, unsafeWithoutPrefix, dappOperationId }) => {
    return await operationManager.signMessage(uuid, message, unsafeWithoutPrefix, dappOperationId);
  });

  Wallet.SignTransactionV2.registerResponder(async ({ accountUUID, networkIdentifier, transaction }) => {
    return await operationManager.signTransaction(accountUUID, networkIdentifier, transaction);
  });

  return { storageManager, operationManager, provider };
}
