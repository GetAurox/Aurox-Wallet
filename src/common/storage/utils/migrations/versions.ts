const stateMigrationVersionsTopic = "state_migration_versions";

export async function getVersion(topic: string) {
  const { [stateMigrationVersionsTopic]: versions } = await chrome.storage.local.get(stateMigrationVersionsTopic);

  if (!versions || typeof versions[topic] !== "number") return 0;

  return versions[topic];
}

export async function setVersion(topic: string, version: number) {
  const { [stateMigrationVersionsTopic]: versions = {} } = await chrome.storage.local.get(stateMigrationVersionsTopic);

  const newVersionsValue = { ...versions, [topic]: version };

  await chrome.storage.local.set({ [stateMigrationVersionsTopic]: newVersionsValue });
}
