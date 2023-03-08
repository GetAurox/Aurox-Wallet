import { CiphertextBundle } from "common/crypto";

const MAX_SAVE_SLOTS = 3;

const lastUsedSaveSlot = "encrypted_wallet_last_used_save_slot";

const saveSlotTopicPrefix = "encrypted_wallet_save_slot_";

async function getLastUsedSaveSlot() {
  const { [lastUsedSaveSlot]: result } = await chrome.storage.local.get(lastUsedSaveSlot);

  return typeof result === "number" ? result : null;
}

async function getNextSaveSlot() {
  const lastUsed = await getLastUsedSaveSlot();

  if (lastUsed === null) {
    await chrome.storage.local.set({ [lastUsedSaveSlot]: 0 });

    return 0;
  }

  const nextSaveSlot = (lastUsed + 1) % MAX_SAVE_SLOTS;

  await chrome.storage.local.set({ [lastUsedSaveSlot]: nextSaveSlot });

  return nextSaveSlot;
}

function getSaveSlotKey(slot: number) {
  return `${saveSlotTopicPrefix}${slot}`;
}

export async function loadEncryptedWalletDataFromLocalArea(): Promise<CiphertextBundle | null> {
  const lastUsedSaveSlot = await getLastUsedSaveSlot();

  if (lastUsedSaveSlot === null) {
    return null;
  }

  const key = getSaveSlotKey(lastUsedSaveSlot);

  const { [key]: result } = await chrome.storage.local.get(key);

  return result ?? null;
}

export async function saveEncryptedWalletDataToLocalArea(ciphertextBundle: CiphertextBundle) {
  const nextSaveSlot = await getNextSaveSlot();

  const key = getSaveSlotKey(nextSaveSlot);

  await chrome.storage.local.set({ [key]: ciphertextBundle });
}
