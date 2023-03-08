import { DApp as DAppOps } from "common/operations";
import { PublicDappState, SecureDAppState } from "common/states";

import { DAppConnectionManager, NetworkManager, WalletManager } from "serviceWorker/managers";

import { formatChainId } from "common/utils";
import { ETHEREUM_MAINNET_CHAIN_ID } from "common/config";

export async function setupDAppConnectionService(network: NetworkManager, wallet: WalletManager) {
  const manager = new DAppConnectionManager();

  const externalProvider = PublicDappState.buildProvider(PublicDappState.buildDefault());
  const internalProvider = SecureDAppState.buildProvider([]);

  manager.on("connect", connection => {
    const targetNetwork = network.getNetworkByIdentifier(connection.networkIdentifier);

    if (!targetNetwork) {
      throw new Error("Can not resolve current network");
    }

    const address = wallet.getAddress(connection.accountUUID, "evm");

    if (!address) {
      throw new Error("Can not determine account address");
    }

    internalProvider.update(draft => {
      let isUpdated = false;

      for (const oldConnection of draft) {
        if (oldConnection.tabId === connection.tabId && oldConnection.domain === connection.domain) {
          oldConnection.accountUUID = connection.accountUUID;

          isUpdated = true;
        }
      }

      if (!isUpdated) {
        draft.push(connection);
      }
    });

    externalProvider.update(
      draft => {
        draft.accounts = [address];
        draft.chainId = formatChainId(targetNetwork.chainId);
        draft.domain = connection.domain;
        draft.eventName = "connect";
      },
      [connection.tabId],
    );
  });

  manager.on("disconnect", connection => {
    internalProvider.update(draft => {
      return draft.filter(oldConnection => !(oldConnection.tabId === connection.tabId && oldConnection.domain === connection.domain));
    });

    externalProvider.update(
      draft => {
        draft.accounts = [];
        draft.chainId = formatChainId(ETHEREUM_MAINNET_CHAIN_ID);
        draft.domain = connection.domain;
        draft.eventName = "disconnect";
      },
      [connection.tabId],
    );
  });

  manager.on("accountChanged", connection => {
    const address = wallet.getAddress(connection.accountUUID, "evm");

    if (!address) {
      throw new Error("Can not resolve account address");
    }

    internalProvider.update(draft => {
      for (const oldConnection of draft) {
        if (oldConnection.tabId === connection.tabId && oldConnection.domain === connection.domain) {
          oldConnection.accountUUID = connection.accountUUID;
        }
      }
    });

    externalProvider.update(
      draft => {
        draft.accounts = [address];
        draft.domain = connection.domain;
        draft.eventName = "accountsChanged";
      },
      [connection.tabId],
    );
  });

  manager.on("networkChanged", connection => {
    const targetNetwork = network.getNetworkByIdentifier(connection.networkIdentifier);

    if (!targetNetwork) {
      throw new Error("Can not resolve current network");
    }

    internalProvider.update(draft => {
      for (const oldConnection of draft) {
        if (oldConnection.tabId === connection.tabId && oldConnection.domain === connection.domain) {
          oldConnection.networkIdentifier = connection.networkIdentifier;
        }
      }
    });

    externalProvider.update(
      draft => {
        draft.chainId = formatChainId(targetNetwork.chainId);
        draft.domain = connection.domain;
        draft.eventName = "chainChanged";
      },
      [Number(connection.tabId)],
    );
  });

  manager.on("providerChanged", (domain, tabId, preferAurox) => {
    externalProvider.update(
      draft => {
        draft.preferAurox = preferAurox;
        draft.domain = domain;
        draft.eventName = "providerChanged";
      },
      [tabId],
    );
  });

  manager.on("initialized", async (domain, tabId) => {
    const connection = await manager.getTabConnection(domain, tabId);

    if (connection) {
      manager.emit("connect", connection);
      manager.emit("networkChanged", connection);
      manager.emit("accountChanged", connection);

      return;
    }

    await externalProvider.update(
      draft => {
        draft.preferAurox = true;
        draft.domain = domain;
        draft.chainId = formatChainId(ETHEREUM_MAINNET_CHAIN_ID);
        draft.eventName = "connect";
      },
      [tabId],
    );
  });

  DAppOps.ConnectAccount.registerResponder(async data => {
    await manager.connectTab(data);
  });

  DAppOps.SwitchAccount.registerResponder(async data => {
    const { domain: domain, tabId, accountUUID } = data;

    await manager.changeTabAccount(domain, tabId, accountUUID);
  });

  DAppOps.Disconnect.registerResponder(async ({ domain: domain, tabId }) => {
    await manager.disconnectTab(domain, tabId);
  });

  DAppOps.SwitchNetwork.registerResponder(async data => {
    await manager.changeTabNetwork(data.domain, data.tabId, data.targetNetworkIdentifier);
  });

  DAppOps.ChangeConnectionPolicy.registerResponder(async ({ domain: domain, tabId, isDefaultProvider, considerOtherProvider }) => {
    manager.setConnectionPolicy(domain, tabId, isDefaultProvider, considerOtherProvider);
  });

  return { externalProvider, internalProvider, manager };
}
