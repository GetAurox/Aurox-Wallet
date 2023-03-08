import { NetworkManager } from "serviceWorker/managers";
import { PublicNetworkState } from "common/states";
import { Network } from "common/operations";

export async function setupNetworkService() {
  const manager = await new NetworkManager().initialize();

  const provider = PublicNetworkState.buildProvider({
    networks: manager.getAllNetworks(),
  });

  manager.addListener("network-added", async network => {
    await provider.update(draft => {
      draft.networks.push(network);
    });
  });

  manager.addListener("network-removed", async () => {
    await provider.update(draft => {
      draft.networks = manager.getAllNetworks();
    });
  });

  manager.addListener("network-modified", async networkIdentifier => {
    await provider.update(draft => {
      const targetIndex = draft.networks.findIndex(({ identifier }) => identifier === networkIdentifier);
      const modified = manager.getNetworkByIdentifier(networkIdentifier);

      if (targetIndex >= 0 && modified) {
        draft.networks[targetIndex] = modified;
      }
    });
  });

  Network.AddNetwork.registerResponder(async data => {
    await manager.addNetwork(data.newNetwork);
  });

  Network.RemoveNetwork.registerResponder(async data => {
    await manager.removeNetwork(data.targetNetworkIdentifier);
  });

  Network.ModifyNetwork.registerResponder(async data => {
    await manager.modifyNetwork(data.targetNetworkIdentifier, data.updates);
  });

  return { manager, provider };
}
