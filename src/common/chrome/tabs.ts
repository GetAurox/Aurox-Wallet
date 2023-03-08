import psl from "psl";

import { tryParseURL } from "common/utils";

export async function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  return tab ?? null;
}

export async function getCurrentTabHostname() {
  const tab = await getCurrentTab();

  if (tab && tab.url && tryParseURL(tab.url)) {
    const url = new URL(tab.url);

    return url.hostname;
  }

  throw new Error("Failed to determine website hostname");
}

export function getDomainFromHostname(hostname: string) {
  const parsedDomain = psl.parse(hostname);

  if (parsedDomain.error || !parsedDomain.domain) {
    return null;
  }

  return parsedDomain.domain;
}

export async function getValidTabIds() {
  const tabs = await chrome.tabs.query({ discarded: false });

  return tabs.map(tab => tab.id!).filter(id => typeof id === "number");
}
