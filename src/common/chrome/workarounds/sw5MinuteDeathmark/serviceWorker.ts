import { SW_5_MINUTE_DEATHMARK_WORKAROUND_PROBE_CHANNEL, SW5MinuteDeathmarkWorkaroundProbePayload } from "./common";

const startTimeMs = Date.now();

export function setupSW5MinuteDeathmarkWorkaroundForServiceWorker() {
  // This ensures that the service worker will keep itself alive as long as it possibly can
  const keepSelfAlive = () => {
    setTimeout(keepSelfAlive, 1000);
  };

  keepSelfAlive();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.topic === SW_5_MINUTE_DEATHMARK_WORKAROUND_PROBE_CHANNEL) {
      sendResponse({ startTimeMs } as SW5MinuteDeathmarkWorkaroundProbePayload);
    }
  });
}
