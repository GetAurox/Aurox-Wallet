const topic = "accounts_auto_import_last_check_timestamp";

export async function saveAccountsAutoImportLastCheckTimestampToLocalArea(timestamp: number) {
  await chrome.storage.local.set({ [topic]: timestamp });
}

export async function loadAccountsAutoImportLastCheckTimestampFromLocalArea(): Promise<number | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  if (!result) {
    return null;
  }

  const lastCheckTimestamp = Number.parseInt(result);

  return Number.isNaN(lastCheckTimestamp) ? 0 : lastCheckTimestamp;
}
