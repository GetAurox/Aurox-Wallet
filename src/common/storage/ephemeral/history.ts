import { Location } from "history";

import { getCurrentEntity } from "common/entities";

import { getEphemeralLocalStorageKey } from "./utils";

const topic = "history";

async function getKey() {
  const entity = getCurrentEntity();

  return getEphemeralLocalStorageKey(`${topic}::${entity}`);
}

export async function saveHistoryToEphemeralArea(entries: Location[], index: number) {
  const key = await getKey();

  if (key) {
    await chrome.storage.local.set({ [key]: { entries, index } });
  }
}

export async function loadHistoryFromEphemeralArea(): Promise<{ entries: Location[]; index: number } | null> {
  const key = await getKey();

  if (!key) {
    return null;
  }

  const { [key]: history } = await chrome.storage.local.get(key);

  return history ?? null;
}
