const topic = "notifications";

export async function saveNotificationsToLocalArea(notifications: string[][]) {
  await chrome.storage.local.set({ [topic]: notifications });
}

export async function loadNotificationsFromLocalArea(): Promise<string[][] | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  return result ?? null;
}
