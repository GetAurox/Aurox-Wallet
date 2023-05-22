import { SecureGaslessTransactionState } from "common/states";
import { EVMTransactions } from "common/operations";

import {
  WalletManager,
  EVMTransactionsOperationManager,
  EVMTransactionsStorageManager,
  EVMTransactionsGaslessManager,
} from "serviceWorker/managers";

export async function setupGaslessTransactionsService(
  walletManager: WalletManager,
  storageManager: EVMTransactionsStorageManager,
  operationManager: EVMTransactionsOperationManager,
) {
  const gaslessManager = new EVMTransactionsGaslessManager(operationManager, storageManager, walletManager);

  const gaslessProvider = SecureGaslessTransactionState.buildProvider({ swapTransactionSigned: false, approvalTransactionSigned: false });

  gaslessManager.on("approval-signed", () => {
    gaslessProvider.update(draft => {
      draft.approvalTransactionSigned = true;
    });
  });

  gaslessManager.on("swap-signed", () => {
    gaslessProvider.update(draft => {
      draft.swapTransactionSigned = true;
    });
  });

  gaslessManager.on("gasless-completed", gaslessTransactionHash => {
    gaslessProvider.update(draft => {
      draft.gaslessTransactionHash = gaslessTransactionHash;
    });
  });

  EVMTransactions.SendEVMTransactionGasless.registerResponder(
    async ({ accountUUID, networkIdentifier, approvalTransaction, swapTransaction }) => {
      // Reset the state before submitting a new gasless transaction
      await gaslessProvider.update(draft => {
        draft.gaslessTransactionHash = undefined;
        draft.swapTransactionSigned = false;
        draft.approvalTransactionSigned = false;
      });

      return await gaslessManager.perform(accountUUID, networkIdentifier, swapTransaction, approvalTransaction);
    },
  );

  EVMTransactions.CancelEVMTransactionGasless.registerResponder(async () => {
    await gaslessProvider.update(draft => {
      draft.gaslessTransactionHash = undefined;
      draft.swapTransactionSigned = false;
      draft.approvalTransactionSigned = false;
    });
  });

  return { gaslessManager, gaslessProvider };
}
