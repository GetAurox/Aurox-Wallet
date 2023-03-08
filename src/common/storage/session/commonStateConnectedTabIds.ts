import uniq from "lodash/uniq";

const topic = "common-state-connected-tab-ids";

function getKey(subTopic: string) {
  return `${topic}::${subTopic}`;
}

export async function saveCommonStateConnectedTabIdsToSessionArea(subTopic: string, ids: number[]) {
  const key = getKey(subTopic);

  await chrome.storage.session.set({ [key]: ids });
}

export async function loadCommonStateConnectedTabIdsFromSessionArea(subTopic: string): Promise<number[]> {
  const key = getKey(subTopic);

  const { [key]: ids } = await chrome.storage.session.get(key);

  return ids ?? [];
}

export async function addToCommonStateConnectedTabIdsOnSessionArea(subTopic: string, id: number) {
  const currentIds = await loadCommonStateConnectedTabIdsFromSessionArea(subTopic);

  const key = getKey(subTopic);

  await chrome.storage.session.set({ [key]: uniq([...currentIds, id]) });
}
