import { SecureImportedAssetState } from "common/states";
import { ImportedAsset } from "common/operations";

import { applyImportedAssetUpdates, ImportedAssetManager, NetworkManager, WalletManager } from "../managers";

export async function setupImportedAssetService(walletManager: WalletManager, networkManager: NetworkManager) {
  const manager = new ImportedAssetManager();

  await manager.initialize();

  const syncManagerAccounts = () => manager.syncAccounts(walletManager.getAllAccountInfo());

  if (walletManager.isUnlocked) {
    await syncManagerAccounts();
  }

  walletManager.addListener("wallet-unlocked", syncManagerAccounts);

  walletManager.addListener("wallet-locked", () => manager.syncAccounts([]));

  walletManager.addListener("account-imported-hardware", syncManagerAccounts);
  walletManager.addListener("account-imported-private-key", syncManagerAccounts);
  walletManager.addListener("account-imported-mnemonic-wallet", syncManagerAccounts);
  walletManager.addListener("account-removed", syncManagerAccounts);
  walletManager.addListener("accounts-created", syncManagerAccounts);

  await manager.syncNetworks(networkManager.getAllNetworks());

  networkManager.addListener("network-added", () => {
    manager.syncNetworks(networkManager.getAllNetworks());
  });

  networkManager.addListener("network-modified", () => {
    manager.syncNetworks(networkManager.getAllNetworks());
  });

  networkManager.addListener("network-removed", async removedNetworkIdentifier => {
    const { excludedAssetKeys } = await manager.cleanUpRemovedNetwork(removedNetworkIdentifier);

    if (excludedAssetKeys.length > 0) {
      await provider.update(draft => {
        draft.assets = manager.getAllImportedAssets();
      });
    }
  });

  const provider = SecureImportedAssetState.buildProvider({
    assets: manager.getAllImportedAssets(),
  });

  manager.addListener("asset-removed", targetAssetKey => {
    provider.update(draft => {
      draft.assets = draft.assets.filter(asset => asset.key !== targetAssetKey);
    });
  });

  manager.addListener("assets-modified", updates => {
    provider.update(draft => {
      applyImportedAssetUpdates(draft.assets, updates);
    });
  });

  manager.addListener("assets-imported", importedAssets => {
    provider.update(draft => {
      draft.assets.push(...importedAssets);
    });
  });

  manager.addListener("network-assets-removed", () => {
    provider.update(draft => {
      draft.assets = manager.getAllImportedAssets();
    });
  });

  manager.addListener("networks-synced", () => {
    provider.update(draft => {
      draft.assets = manager.getAllImportedAssets();
    });
  });

  ImportedAsset.ImportNewAsset.registerResponder(async data => {
    return await manager.importNewAsset(data.asset);
  });

  ImportedAsset.RemoveImportedAsset.registerResponder(async data => {
    await manager.removeImportedAsset(data.targetAssetKey);
  });

  ImportedAsset.SetVisibility.registerResponder(async data => {
    await manager.setVisibility(data.targetAssetKey, data.newVisibilityValue, data.tokenType);
  });

  ImportedAsset.UpdateImportedNFTAsset.registerResponder(async data => {
    await manager.updateCustomNFTAssets([data.updatedNFTAsset]);
  });

  return { manager, provider };
}
