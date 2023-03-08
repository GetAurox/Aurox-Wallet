import cloneDeep from "lodash/cloneDeep";

export interface MigrationLogEntry {
  migratedAt: string;
  oldVersion: number;
  newVersion: number;
  sensitive: boolean;
  backup?: any;
}

const stateMigrationLogsTopic = "state_migration_logs";

export async function addLogEntry(topic: string, entry: MigrationLogEntry) {
  const { [stateMigrationLogsTopic]: oldLogs } = await chrome.storage.local.get(stateMigrationLogsTopic);

  const newLogsBundle: Record<string, MigrationLogEntry[]> = oldLogs ? cloneDeep(oldLogs) : {};

  if (!Array.isArray(newLogsBundle[topic])) {
    newLogsBundle[topic] = [];
  }

  newLogsBundle[topic].push(entry);

  await chrome.storage.local.set({ [stateMigrationLogsTopic]: newLogsBundle });
}
