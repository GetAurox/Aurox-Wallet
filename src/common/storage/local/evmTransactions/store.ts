import { EVMTransactions } from "common/types";

import { migrator } from "./migrations";

const topic = "evm_transactions_data";

export async function saveEVMTransactionsDataToLocalArea(data: EVMTransactions) {
  await chrome.storage.local.set({ [topic]: data });
}

export async function loadEVMTransactionsDataFromLocalArea(): Promise<EVMTransactions | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  if (result) {
    const migrated = await migrator.migrateIfNeeded(result);

    if (migrated !== result) {
      await saveEVMTransactionsDataToLocalArea(migrated);

      return migrated;
    }
  }

  return result ?? null;
}
