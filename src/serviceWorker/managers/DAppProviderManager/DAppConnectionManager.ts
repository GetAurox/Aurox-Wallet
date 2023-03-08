import { TypedEmitter } from "tiny-typed-emitter";

import { DAppTabConnection } from "common/types";
import { deleteDAppTabConnection, loadDAppTabConnection, saveDAppTabConnection } from "common/storage";

export interface DAppConnectionManagerEvents {
  "networkChanged": (connection: DAppTabConnection) => void;
  "accountChanged": (connection: DAppTabConnection) => void;
  "connect": (connection: DAppTabConnection) => void;
  "disconnect": (connection: DAppTabConnection) => void;
  "providerChanged": (domain: string, tabId: number, preferAurox: boolean) => void;
  "initialized": (domain: string, tabId: number) => void;
}

interface ProviderConnectionPolicy {
  isDefaultProvider: boolean;
  considerOtherProvider: boolean;
}

export class DAppConnectionManager extends TypedEmitter<DAppConnectionManagerEvents> {
  #dappConnectionLocks: Record<string, boolean> = {};
  #dappDefaultProviderMap: Record<string, ProviderConnectionPolicy> = {};
  #connectionCleanupSubscriptions: Record<string, (tabId: number) => Promise<void>> = {};
  #preferredNetworkRegistrations: Record<string, string> = {};

  #subscribeConnectionCleanup = async (domain: string, tabId: number) => {
    const tabs = await chrome.tabs.query({ discarded: false });
    const tab = tabs.find(tab => typeof tab.id === "number" && tab.id === tabId);

    if (!tab) {
      await deleteDAppTabConnection(domain, tabId);

      throw new Error("This tab no longer exists");
    }

    const key = `${domain}::${tabId}`;

    const cleanup = async (removedTabId: number) => {
      if (removedTabId === tabId) {
        this.disconnectTab(domain, tabId);
      }
    };

    chrome.tabs.onRemoved.addListener(cleanup);

    this.#connectionCleanupSubscriptions[key] = cleanup;
  };

  #unsubscribeConnectionCleanup = async (domain: string, tabId: number) => {
    const key = `${domain}::${tabId}`;

    const cleanupFunction = this.#connectionCleanupSubscriptions[key];

    if (!cleanupFunction) {
      throw new Error("Integrity error, cleanup is not registered on connection!");
    }

    chrome.tabs.onRemoved.removeListener(cleanupFunction);

    delete this.#dappDefaultProviderMap[key];
    delete this.#connectionCleanupSubscriptions[key];
  };

  disableConnection(domain: string, tabId: number) {
    const key = `${domain}::${tabId}`;

    this.#dappConnectionLocks[key] = true;
  }

  enableConnection(domain: string, tabId: number) {
    const key = `${domain}::${tabId}`;

    this.#subscribeConnectionCleanup(domain, tabId);

    this.#dappConnectionLocks[key] = false;
  }

  isConnectionLocked(domain: string, tabId: number) {
    const key = `${domain}::${tabId}`;

    return this.#dappConnectionLocks[key] === true;
  }

  setConnectionPolicy(domain: string, tabId: number, isDefaultProvider: boolean, considerOtherProvider: boolean) {
    const key = `${domain}::${tabId}`;

    this.#dappDefaultProviderMap[key] = { isDefaultProvider, considerOtherProvider };

    this.emit("providerChanged", domain, tabId, isDefaultProvider);
  }

  getConnectionPolicy(domain: string, tabId: number): ProviderConnectionPolicy {
    const key = `${domain}::${tabId}`;

    return this.#dappDefaultProviderMap[key] ?? { isDefaultProvider: true, considerOtherProvider: false };
  }

  registerPreferredTabNetwork(domain: string, tabId: number, networkIdentifier: string) {
    const key = `${domain}::${tabId}`;

    this.#preferredNetworkRegistrations[key] = networkIdentifier;

    this.emit("networkChanged", { domain: domain, tabId, networkIdentifier, accountUUID: "" });
  }

  async getPreferredTabNetwork(domain: string, tabId: number) {
    const key = `${domain}::${tabId}`;

    const connection = await this.getTabConnection(domain, tabId);

    if (connection) {
      delete this.#preferredNetworkRegistrations[key];

      return connection.networkIdentifier;
    }

    return this.#preferredNetworkRegistrations[key];
  }

  async getTabConnection(domain: string, tabId: number) {
    return await loadDAppTabConnection(domain, tabId);
  }

  async connectTab(connection: DAppTabConnection) {
    if (this.isConnectionLocked(connection.domain, connection.tabId)) {
      throw new Error("Connection is currently disabled for this dapp");
    }

    await saveDAppTabConnection(connection);

    this.emit("connect", connection);
  }

  async changeTabNetwork(domain: string, tabId: number, networkIdentifier: string) {
    const connection = await this.getTabConnection(domain, tabId);

    if (!connection) {
      throw new Error("Connection does not exist, can not change network");
    }

    connection.networkIdentifier = networkIdentifier;

    await saveDAppTabConnection(connection);

    this.emit("networkChanged", connection);
  }

  async changeTabAccount(domain: string, tabId: number, accountUUID: string) {
    const connection = await this.getTabConnection(domain, tabId);

    if (!connection) {
      throw new Error("Connection does not exist, can not change account");
    }

    connection.accountUUID = accountUUID;

    await saveDAppTabConnection(connection);

    this.emit("accountChanged", connection);
  }

  async disconnectTab(domain: string, tabId: number) {
    const connection = await this.getTabConnection(domain, tabId);

    if (!connection) {
      throw new Error("Can not remove non-existing connection");
    }

    this.#unsubscribeConnectionCleanup(domain, tabId);

    await deleteDAppTabConnection(domain, tabId);

    this.emit("disconnect", connection);
  }
}
