import { getIsInServiceWorker } from "common/entities";

import {
  GOOGLE_CHROME_DEATHMARK_TIMEOUT,
  GOOGLE_CHROME_DEATHMARK_TIMEOUT_THRESHOLD,
  GOOGLE_CHROME_DEATHMARK_TIMEOUT_BLACKOUT,
  GOOGLE_CHROME_DEATHMARK_TIMEOUT_BLACKOUT_THRESHOLD,
  probeServiceWorker,
} from "./common";

const PROBE_RETRY_DELAY = 100;

let currentServiceWorkerStartTimeMs: number | null = null;

let asserterPromise: Promise<void> | null;

async function blackoutIfNeeded() {
  if (currentServiceWorkerStartTimeMs === null) {
    return;
  }

  const timeAliveMs = Date.now() - currentServiceWorkerStartTimeMs;

  const deathmarkPlusBlackoutThreshold = GOOGLE_CHROME_DEATHMARK_TIMEOUT + GOOGLE_CHROME_DEATHMARK_TIMEOUT_BLACKOUT_THRESHOLD;

  if (timeAliveMs > deathmarkPlusBlackoutThreshold) {
    // This means that resurrection is probably taking place already, so there is no need to blackout, we just need to wait for the resurrection to finish
    return;
  }

  const deathmarkMinusBlackout = GOOGLE_CHROME_DEATHMARK_TIMEOUT - GOOGLE_CHROME_DEATHMARK_TIMEOUT_BLACKOUT;

  const timeAliveAfterBlackout = timeAliveMs - deathmarkMinusBlackout;

  if (timeAliveAfterBlackout > 0) {
    const timeToBlackoutThreshold = deathmarkPlusBlackoutThreshold - timeAliveMs;

    await new Promise(resolve => setTimeout(resolve, timeToBlackoutThreshold));
  }
}

function shouldAssert() {
  if (currentServiceWorkerStartTimeMs === null) {
    return true;
  }

  const timeAliveMs = Date.now() - currentServiceWorkerStartTimeMs;

  const deathmarkMinusThreshold = GOOGLE_CHROME_DEATHMARK_TIMEOUT - GOOGLE_CHROME_DEATHMARK_TIMEOUT_THRESHOLD;

  return timeAliveMs > deathmarkMinusThreshold;
}

async function startAsserter() {
  while (true) {
    try {
      // This message also acts as a resurrection method
      const { startTimeMs } = await probeServiceWorker();

      currentServiceWorkerStartTimeMs = startTimeMs;

      return;
    } catch {
      await new Promise(resolve => setTimeout(resolve, PROBE_RETRY_DELAY));
    }
  }
}

export async function assertServiceWorkerIsAlive() {
  if (getIsInServiceWorker()) {
    return;
  }

  await blackoutIfNeeded();

  if (!shouldAssert()) {
    return;
  }

  if (!asserterPromise) {
    asserterPromise = startAsserter();
    asserterPromise.then(() => (asserterPromise = null));
  }

  return asserterPromise;
}
