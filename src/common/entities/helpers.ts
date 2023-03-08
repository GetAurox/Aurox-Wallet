import { POPUP_URL, EXPANDED_URL, HARDWARE_URL, CONNECT_URL, ONBOARDING_URL } from "./constants";
import { ExtensionEntity } from "./types";

const sw = globalThis as any as ServiceWorkerGlobalScope;

const isInServiceWorker = typeof sw.skipWaiting === "function";

export function getIsInServiceWorker() {
  return isInServiceWorker;
}

export function getCurrentEntity(): ExtensionEntity {
  if (isInServiceWorker) {
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
