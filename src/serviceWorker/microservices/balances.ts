import { PublicBalancesState } from "common/states";
import { Balances } from "common/operations";

import { WalletManager, NetworkManager, ImportedAssetManager, MultichainBalanceManager } from "serviceWorker/managers";

export async function setupBalancesService(
  walletManager: WalletManager,
  networkManager: NetworkManager,
  importedAssetManager: ImportedAssetManager,
) {
  const initialNetworks = networkManager.getAllNetworks();
  const initialImportedAssets = importedAssetManager.getAllImportedAssets();

  const manager = await new MultichainBalanceManager(initialNetworks, initialImportedAssets).initialize();

  if (walletManager.isUnlocked) {
    const activeAccount = walletManager.getActiveAccountInfo();

    if (activeAccount) {
      manager.setActiveAccountInfo(activeAccount);
    }
  }

  const provider = PublicBalancesState.buildProvider(manager.getCurrentBalancesState());

  manager.addListener("patch", patches => {
    provider.patch(patches);
  });

  const syncAccountWithWalletManager = () => {
    const activeAccount = walletManager.getActiveAccountInfo();

    manager.setActiveAccountInfo(activeAccount);
  };

  walletManager.addListener("active-account-changed", syncAccountWithWalletManager);
  walletManager.addListener("wallet-unlocked", syncAccountWithWalletManager);

  walletManager.addListener("wallet-locked", () => {
    manager.setActiveAccountInfo(null);
  });

  walletManager.addListener("account-removed", accountUUID => {
    manager.discardAccount(accountUUID);
  });

  networkManager.addListener("network-modified", () => {
    manager.setNetworks(networkManager.getAllNetworks());
  });

  networkManager.addListener("network-added", newNetwork => {
    manager.addNetwork(newNetwork);
  });

  networkManager.addListener("network-removed", removedNetworkIdentifier => {
    manager.removeNetwork(removedNetworkIdentifier);
  });

  importedAssetManager.addListener("assets-modified", updates => {
    manager.applyAssetModifications(updates);
  });

  importedAssetManager.addListener("assets-imported", importedAssets => {
    manager.addImportedAssets(importedAssets);
  });

  importedAssetManager.addListener("asset-removed", removedAssetIdentifier => {
    manager.removeImportedAsset(removedAssetIdentifier);
  });

  Balances.ForceSync.registerResponder(async data => {
    await manager.forceSyncTargetAssets(data.targetAssetKeys);
  });

  return { manager, provider };
}
