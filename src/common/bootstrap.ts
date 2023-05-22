import { enablePatches } from "immer";

import { setupSWKeepAliveForFrames } from "common/chrome/workarounds/swKeepAlive/frames";

import { getIsServiceWorkerContext } from "./sw";

enablePatches();

if (!getIsServiceWorkerContext()) {
  setupSWKeepAliveForFrames();
}
