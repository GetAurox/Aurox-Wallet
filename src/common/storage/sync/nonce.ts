import { getTimeInMilliseconds } from "common/utils";

const topic = "nonce";

function getKey(accountIdentifier: string, networkIdentifier: string) {
  return `${topic}::${accountIdentifier}::${networkIdentifier}`;
}

export async function saveNonceToSyncArea(accountUUID: string, networkIdentifier: string, nonce: number) {
  const key = getKey(accountUUID, networkIdentifier);

  const expiryTime = getTimeInMilliseconds({ unit: "minute", amount: 15 });

  const expiresIn = Date.now() + expiryTime;

  await chrome.storage.sync.set({ [key]: { nonce, expiresIn } });
}

export async function loadNonceFromSyncArea(accountUUID: string, networkIdentifier: string): Promise<number | null> {
  const key = getKey(accountUUID, networkIdentifier);

  const { [key]: result } = await chrome.storage.sync.get(key);

  if (!result || result.expiresIn < Date.now()) {
    return null;
  }

  return result.nonce;
}
