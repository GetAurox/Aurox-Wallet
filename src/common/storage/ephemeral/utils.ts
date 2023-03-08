const EPHEMERAL_LOCAL_STORAGE_KEY_PREFIX = "ephemeral::";

const ephemeralResetPerformedSessionKey = "ephemeral_reset_performed";

export function getEphemeralLocalStorageKey(topic: string) {
  return `${EPHEMERAL_LOCAL_STORAGE_KEY_PREFIX}${topic}`;
}

export async function resetEphemeralStorage() {
  const { [ephemeralResetPerformedSessionKey]: resetWasPerformedInThisSession } = await chrome.storage.session.get(
    ephemeralResetPerformedSessionKey,
  );

  if (resetWasPerformedInThisSession) {
    return;
  }

  const allLocalStorageData = await chrome.storage.local.get(null);

  const ephemeralKeys = Object.keys(allLocalStorageData).filter(key => key.startsWith(EPHEMERAL_LOCAL_STORAGE_KEY_PREFIX));

  if (ephemeralKeys.length > 0) {
    await chrome.storage.local.remove(ephemeralKeys);
  }

  await chrome.storage.session.set({ [ephemeralResetPerformedSessionKey]: true });
}
