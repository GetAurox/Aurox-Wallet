// For some reason it's not exactly 5 minutes, but rather 330 seconds
export const GOOGLE_CHROME_DEATHMARK_TIMEOUT = 330 * 1000;

// Start asserting service worker is alive 5 seconds before it's designated deathmark
export const GOOGLE_CHROME_DEATHMARK_TIMEOUT_THRESHOLD = 5 * 1000;

// For 2.5 seconds before the designated death mark, the entire extension will blackout to make sure the deathmark does not
// happen while a query is being executed to reduce the chance of data corruption
export const GOOGLE_CHROME_DEATHMARK_TIMEOUT_BLACKOUT = 2.5 * 1000;

// Blackout threshold is the wait time after blackout is supposedly over to make sure timing fluctuations won't affect the logic
export const GOOGLE_CHROME_DEATHMARK_TIMEOUT_BLACKOUT_THRESHOLD = 1.5 * 1000;

export const SW_5_MINUTE_DEATHMARK_WORKAROUND_PROBE_CHANNEL = "hacks/sw_5_minute_deathmark_workaround_probe";

// How long to wait for probe to actually response
const PROBE_TIMEOUT = 300;

export interface SW5MinuteDeathmarkWorkaroundProbePayload {
  startTimeMs: number;
}

export async function probeServiceWorker(): Promise<SW5MinuteDeathmarkWorkaroundProbePayload> {
  const startTimeMs = await new Promise<number>((resolve, reject) => {
    let settled = false;

    const timeoutTimer = setTimeout(() => {
      if (settled) return;

      settled = true;

      reject(new Error("Probe timedout"));
    }, PROBE_TIMEOUT);

    try {
      chrome.runtime.sendMessage(
        { topic: SW_5_MINUTE_DEATHMARK_WORKAROUND_PROBE_CHANNEL },
        (payload: SW5MinuteDeathmarkWorkaroundProbePayload) => {
          if (settled) return;

          clearTimeout(timeoutTimer);
          settled = true;

          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message ?? "Unknown Error occurred while probing service worker"));
          }

          if (!payload || typeof payload.startTimeMs !== "number") {
            reject(new Error("Did not receive valid startTimeMs from service worker"));
          } else {
            resolve(payload.startTimeMs);
          }
        },
      );
    } catch (error) {
      if (settled) return;

      clearTimeout(timeoutTimer);
      settled = true;

      reject(error);
    }
  });

  return { startTimeMs };
}
