import keyBy from "lodash/keyBy";

import { createStateMigrator } from "common/storage/utils";
import { BlockchainNetwork } from "common/types";
import { buildDefaultSecondaryNetworks, buildDefaultMainNetworks } from "common/config/defaultNetworks";

const topic = "networks";

async function loadNetworksFromSyncArea(): Promise<BlockchainNetwork[] | null> {
  const { [topic]: result } = await chrome.storage.sync.get(topic);

  return result;
}

async function v0_initNetworks(): Promise<BlockchainNetwork[]> {
  let old = await loadNetworksFromSyncArea();

  if (!old) {
    old = buildDefaultMainNetworks();
  }

  const result: BlockchainNetwork[] = [...old];
  const additionalNetworks: BlockchainNetwork[] = buildDefaultSecondaryNetworks();
  const oldNetworks = keyBy(old, "identifier");

  for (const network of additionalNetworks) {
    if (!oldNetworks[network.identifier]) {
      result.push(network);
    }
  }

  return result;
}

// the order is very critical, never change this array, only append
const migrations = [v0_initNetworks];

const migrator = createStateMigrator<BlockchainNetwork[]>(topic, migrations, { sensitive: false });

export { migrator };
