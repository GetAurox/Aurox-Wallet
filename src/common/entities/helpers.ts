import { getIsServiceWorkerContext } from "common/sw";

import { POPUP_URL, EXPANDED_URL, HARDWARE_URL, CONNECT_URL, ONBOARDING_URL } from "./constants";
import { ExtensionEntity } from "./types";

export function getCurrentEntity(): ExtensionEntity {
  if (getIsServiceWorkerContext()) {
    return "service-worker";
  }

  const url = window.location.href;

  if (url.startsWith(CONNECT_URL)) {
    return "connect";
  }

  if (url.startsWith(EXPANDED_URL)) {
    return "expanded";
  }

  if (url.startsWith(ONBOARDING_URL)) {
    return "onboarding";
  }

  if (url.startsWith(HARDWARE_URL)) {
    return "hardware";
  }

  if (url.startsWith(POPUP_URL)) {
    return "popup";
  }

  return "content-script";
}
