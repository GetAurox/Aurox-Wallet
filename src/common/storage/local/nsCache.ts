const topic = "ns_cache";

export async function saveNSCacheToLocalArea(nsCache: Record<string, [string, number]>) {
  await chrome.storage.local.set({ [topic]: nsCache });
}

export async function loadNSCacheFromLocalArea(): Promise<Record<string, [string, number]> | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  return result ?? null;
}
