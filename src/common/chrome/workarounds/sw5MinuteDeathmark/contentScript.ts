import clamp from "lodash/clamp";

import { GOOGLE_CHROME_DEATHMARK_TIMEOUT, GOOGLE_CHROME_DEATHMARK_TIMEOUT_THRESHOLD, probeServiceWorker } from "./common";

// When resurrection fails wait 200ms before trying again
const RESURRECTION_RETRY_DELAY = 200;

// Start resurrection attempts from 1 second before the designated deathmark
const RESURRECTION_SAFEZONE = 1000;

// When we are in the safe zone we will recheck every 1 second to make sure death has not come sooner
const RESURRECTION_SAFEZONE_RECHECK_DELAY = 1000;

// When we are past the safezone, we are very close to the deathmark, now we must try every 300ms to make sure we bring
// back the service_worker as soon as it gets killed by google chrome
const RESURRECTION_ATTEMP_DELAY = 300;

async function resurrectServiceWorkerIfDead() {
  try {
    // startTimeMs will change to the new service worker upon Resurrection
    const { startTimeMs } = await probeServiceWorker();

    const timeAlive = Date.now() - startTimeMs;

    const timeToThreshold = GOOGLE_CHROME_DEATHMARK_TIMEOUT - GOOGLE_CHROME_DEATHMARK_TIMEOUT_THRESHOLD - timeAlive;

    if (timeToThreshold > 0) {
      // We don't need to flood the service worker when it's not close to its deathmark
      setTimeout(resurrectServiceWorkerIfDead, timeToThreshold);

      return;
    }

    // check every second to make sure death does not come before the safezone (chrome developers have proven to be untrustworthy)
    const timeToDeathmarkSafezone = GOOGLE_CHROME_DEATHMARK_TIMEOUT - RESURRECTION_SAFEZONE - timeAlive;

    if (timeToDeathmarkSafezone > 0) {
      // We don't need to flood the service worker when it's not close to its deathmark
      setTimeout(resurrectServiceWorkerIfDead, clamp(timeToDeathmarkSafezone, 0, RESURRECTION_SAFEZONE_RECHECK_DELAY));

      return;
    }

    // Now we are outsize the safezone, we must attempt to resurrect rapidly
    setTimeout(resurrectServiceWorkerIfDead, RESURRECTION_ATTEMP_DELAY);
  } catch {
    setTimeout(resurrectServiceWorkerIfDead, RESURRECTION_RETRY_DELAY);
  }
}

export function setupSW5MinuteDeathmarkWorkaroundForContentScript() {
  // In mock mode, resurrection does not make sense as it is run in the same context as the mocked site
  if (process.env.MOCK_EXTENSION_API === "true") return;

  resurrectServiceWorkerIfDead();
}
