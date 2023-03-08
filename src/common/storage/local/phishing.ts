import { PhishingWarningOverlayData } from "common/types";

const topic = "phishing_warning_overlay_data";

export async function savePhishingWarningOverlayDataToLocalArea({ host, timestamp }: PhishingWarningOverlayData) {
  await chrome.storage.local.set({ [topic]: `${host}::${timestamp}` });
}

export async function loadPhishingWarningOverlayDataFromLocalArea(): Promise<PhishingWarningOverlayData | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  if (!result) {
    return null;
  }

  const [host, timestamp] = result.split("::");

  const lastShown = Number.parseInt(timestamp);

  return { host, timestamp: Number.isNaN(lastShown) ? 0 : lastShown };
}
