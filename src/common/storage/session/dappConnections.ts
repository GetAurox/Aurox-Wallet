import { DAppTabConnection } from "common/types";

const topic = "dapp-connections";

function getKey(domain: string, tabId: number) {
  return `${topic}::${domain}||${tabId}`;
}

export async function saveDAppTabConnection(connection: DAppTabConnection) {
  const key = getKey(connection.domain, connection.tabId);

  await chrome.storage.session.set({ [key]: connection });
}

export async function loadDAppTabConnection(domain: string, tabId: number): Promise<DAppTabConnection> {
  const key = getKey(domain, tabId);

  const { [key]: connection } = await chrome.storage.session.get(key);

  return connection ?? null;
}

export async function deleteDAppTabConnection(domain: string, tabId: number) {
  const key = getKey(domain, tabId);

  await chrome.storage.session.remove(key);
}
