import isEqual from "lodash/isEqual";

import { BlockchainNetwork, ChainType } from "common/types";

import { SolanaProvider } from "./SolanaProvider";
import { EVMProvider } from "./evm/EVMProvider";

export type SupportedProviders = EVMProvider | SolanaProvider;
export type ProviderForChainType<T extends ChainType> = Extract<SupportedProviders, { chainType: T }>;

const createProvider = <T extends BlockchainNetwork>(network: T): SupportedProviders => {
  if (network.chainType === "evm") {
    return new EVMProvider(network);
  }

  throw new Error(`Provider type ${network.chainType} doesn't exist`);
};

export class ProviderManager {
  // Map -> networkIdentifier -> ProviderClass
  static #providers = new Map<string, SupportedProviders>();

  private constructor() {
    // instantiated once as a singleton
  }

  static getProvider<T extends BlockchainNetwork>(network: T) {
    const provider = ProviderManager.#providers.get(network.identifier);

    if (provider && provider.chainType === "evm") {
      const providerConnections = provider.network.connections;

      const networkConnections = network.connections;

      if (isEqual(providerConnections, networkConnections)) {
        return provider;
      }
    }

    // If no provider is found, create one
    const newProvider = createProvider(network);

    // Otherwise store the newly created provider
    ProviderManager.#providers.set(network.identifier, newProvider);

    return newProvider;
  }

  static deleteProvider(networkIdentifier: string) {
    ProviderManager.#providers.delete(networkIdentifier);
  }
}
