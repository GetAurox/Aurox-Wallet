const passwordMemoryTopic = "unsafe__memorized_password";

export async function memorizePasswordToWorkaroundSW5MinuteDeathmark(password: string) {
  await chrome.storage.session.set({ [passwordMemoryTopic]: password });
}

export async function recallPasswordToWorkaroundSW5MinuteDeathmark(): Promise<string | null> {
  const { [passwordMemoryTopic]: password } = await chrome.storage.session.get(passwordMemoryTopic);

  return password ?? null;
}

export async function removePasswordToWorkaroundSW5MinuteDeathmark() {
  await chrome.storage.session.remove(passwordMemoryTopic);
}
