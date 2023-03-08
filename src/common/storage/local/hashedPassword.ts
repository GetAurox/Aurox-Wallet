const topic = "hashed_password";

export async function saveHashedPasswordToLocalArea(hash: string, salt: string) {
  await chrome.storage.local.set({ [topic]: { hash, salt } });
}

export async function loadHashedPasswordFromLocalArea(): Promise<{ hash: string; salt: string } | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  return result ?? null;
}
