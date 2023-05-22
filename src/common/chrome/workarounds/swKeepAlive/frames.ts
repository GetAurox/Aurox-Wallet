import { SW_KEEP_ALIVE_DELAY_BASE, SW_KEEP_ALIVE_DELAY_VARIANCE, SW_KEEP_ALIVE_PROBE_TIMEOUT, SW_KEEP_ALIVE_CHANNEL } from "./constants";

export async function probeServiceWorker() {
  await new Promise<void>((resolve, reject) => {
    let settled = false;

    const timeoutTimer = setTimeout(() => {
      if (settled) return;

      settled = true;

      reject(new Error("Probe timed out"));
    }, SW_KEEP_ALIVE_PROBE_TIMEOUT);

    try {
      chrome.runtime.sendMessage({ topic: SW_KEEP_ALIVE_CHANNEL }, () => {
        if (settled) return;

        clearTimeout(timeoutTimer);
        settled = true;

        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message ?? "Unknown Error occurred while probing service worker"));
        }

        resolve();
      });
    } catch (error) {
      if (settled) return;

      clearTimeout(timeoutTimer);
      settled = true;

      reject(error);
    }
  });
}

const getNextKeepAliveDelay = () => Math.floor(SW_KEEP_ALIVE_DELAY_BASE + SW_KEEP_ALIVE_DELAY_VARIANCE * Math.random());

async function SWKeepAliveWorker() {
  try {
    await probeServiceWorker();
  } catch (error) {
    console.error("Failed to probe Service Worker: ", error);
  } finally {
    setTimeout(SWKeepAliveWorker, getNextKeepAliveDelay());
  }
}

export function setupSWKeepAliveForFrames() {
  // In mock mode, keep alive does not make sense as it is run in the same context as the mocked site
  if (process.env.MOCK_EXTENSION_API === "true") return;

  // If the context does not include a way to probe the service worker, then we have no choice to exclude this context from keep alive logic
  if (!chrome?.runtime?.sendMessage) return;

  setTimeout(SWKeepAliveWorker, getNextKeepAliveDelay());
}
