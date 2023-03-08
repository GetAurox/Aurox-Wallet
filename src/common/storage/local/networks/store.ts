import { BlockchainNetwork } from "common/types";
import { buildDefaultMainNetworks } from "common/config/defaultNetworks";

import { migrator } from "./migrations";

const topic = "networks";

export async function saveNetworksToLocalArea(networks: BlockchainNetwork[]) {
  await chrome.storage.local.set({ [topic]: networks });
}

export async function loadNetworksFromLocalArea(): Promise<BlockchainNetwork[]> {
  const { [topic]: result } = await chrome.storage.local.get(topic);

  const defaultNetworks = buildDefaultMainNetworks();

  const migrated = await migrator.migrateIfNeeded(result);

  if (migrated !== result) {
    await saveNetworksToLocalArea(migrated);
  }

  return (migrated as BlockchainNetwork[]).map(network => {
    const currentDefaultNetwork = defaultNetworks.find(defaultNetwork => defaultNetwork.identifier === network.identifier);

    if (currentDefaultNetwork && currentDefaultNetwork.originalConnections[0].url === network.connections[0].url) {
      return {
        ...network,
        connections: [currentDefaultNetwork.connections[0], network.connections[1]],
        originalConnections: currentDefaultNetwork.originalConnections,
      };
    }

    return network;
  });
}
