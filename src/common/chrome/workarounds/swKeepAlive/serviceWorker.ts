import { SW_KEEP_ALIVE_CHANNEL, SW_KEEP_ALIVE_SELF_PROBE_INTERVAL } from "./constants";

export function setupSWKeepAlive() {
  // This ensures that the service worker will keep itself alive as long as it possibly can
  const keepSelfAlive = () => {
    setTimeout(keepSelfAlive, SW_KEEP_ALIVE_SELF_PROBE_INTERVAL);
  };

  keepSelfAlive();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.topic === SW_KEEP_ALIVE_CHANNEL) {
      sendResponse();
    }
  });
}
