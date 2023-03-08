import { TypedEmitter } from "tiny-typed-emitter";
import { produce } from "immer";

import { BlockchainNetwork, BlockchainNetworkUpdate, ChainType } from "common/types";
import { loadNetworksFromLocalArea, saveNetworksToLocalArea } from "common/storage";

const allowedUpdateProperties: (keyof BlockchainNetworkUpdate)[] = [
  "name",
  "currencySymbol",
  "chainExplorer",
  "connections",
  "chainId",
  "disabled",
];

export interface NetworkManagerEvents {
  "network-added": (network: BlockchainNetwork) => void;
  "network-removed": (removedNetworkIdentifier: string) => void;
  "network-modified": (modifiedNetworkIdentifier: string, updates: BlockchainNetworkUpdate) => void;
}

export class NetworkManager extends TypedEmitter<NetworkManagerEvents> {
  #initialized = false;

  #networks: BlockchainNetwork[] = [];

  #networksMap = new Map<string, BlockchainNetwork>();

  constructor() {
    super();
  }

  public getAllNetworks() {
    if (!this.#initialized) throw new Error("Network manager is not initialized yet!");

    return this.#networks;
  }

  public getAllEnabledNetworks() {
    if (!this.#initialized) throw new Error("Network manager is not initialized yet!");

    return this.#networks.filter(network => !network.disabled);
  }

  public getNetworkByIdentifier(identifier: string) {
    if (!this.#initialized) throw new Error("Network manager is not initialized yet!");

    return this.#networksMap.get(identifier) ?? null;
  }

  public getNetworkByChainTypeAndChainId(chainType: ChainType, chainId: number): BlockchainNetwork | null {
    for (const network of this.#networksMap.values()) {
      if (network.chainType === chainType && network.chainId === chainId) {
        return network;
      }
    }

    return null;
  }

  public async initialize() {
    this.#networks = await loadNetworksFromLocalArea();

    for (const network of this.#networks) {
      this.#networksMap.set(network.identifier, network);
    }

    this.#initialized = true;

    return this;
  }

  public async addNetwork(newNetwork: BlockchainNetwork) {
    if (!this.#initialized) throw new Error("Network manager is not initialized yet!");

    if (this.#networksMap.has(newNetwork.identifier)) throw new Error("The network identifier is already used.");

    this.#networks = [...this.#networks, newNetwork];

    this.#networksMap.set(newNetwork.identifier, newNetwork);

    await saveNetworksToLocalArea(this.#networks);

    this.emit("network-added", newNetwork);
  }

  public async removeNetwork(targetNetworkIdentifier: string) {
    if (!this.#initialized) {
      throw new Error("Network manager is not initialized yet!");
    }

    if (!this.#networksMap.has(targetNetworkIdentifier)) {
      throw new Error("The network identifier is not found.");
    }

    const newNetworksValue = this.#networks.filter(({ identifier }) => identifier !== targetNetworkIdentifier);

    if (newNetworksValue.length === 0) throw new Error("Cannot remove the last network");

    this.#networks = newNetworksValue;

    this.#networksMap.delete(targetNetworkIdentifier);

    await saveNetworksToLocalArea(this.#networks);

    this.emit("network-removed", targetNetworkIdentifier);
  }

  public async modifyNetwork(targetNetworkIdentifier: string, updates: BlockchainNetworkUpdate) {
    if (!this.#initialized) {
      throw new Error("Network manager is not initialized yet!");
    }

    if (!this.#networksMap.has(targetNetworkIdentifier)) {
      throw new Error("The network identifier is not found.");
    }

    const target = this.#networksMap.get(targetNetworkIdentifier)!;

    const updatedTarget = produce(target, draft => {
      for (const property of allowedUpdateProperties) {
        if (updates[property] != null) {
          // typescript has a hard time with this assignment operation
          (draft as any)[property] = updates[property];
        }
      }
    });

    this.#networksMap.set(targetNetworkIdentifier, updatedTarget);

    const targetIndex = this.#networks.findIndex(({ identifier }) => identifier === targetNetworkIdentifier);

    if (targetIndex >= 0) {
      const newNetworksValue = [...this.#networks];

      newNetworksValue[targetIndex] = updatedTarget;

      this.#networks = newNetworksValue;
    }

    await saveNetworksToLocalArea(this.#networks);

    this.emit("network-modified", targetNetworkIdentifier, updates);
  }
}
