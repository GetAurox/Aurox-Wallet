const topic = "onboarding_data";

export async function saveOnboardingData<T>(data: T) {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  await chrome.storage.local.set({ [topic]: { ...result, ...data } });
}

export async function loadOnboardingData<T>(): Promise<T | null> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  if (!result) {
    return null;
  }

  return result;
}
