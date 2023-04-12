import isEqual from "lodash/isEqual";

import { BlockchainNetwork, EVMSupportedNFTContractType } from "common/types";

import { ERC1155Provider, ERC721Provider } from "./evm";

export type SupportedNFTProviders = ERC721Provider | ERC1155Provider;

function createProvider<N extends BlockchainNetwork, T extends EVMSupportedNFTContractType>(
  network: N,
  contractType: T,
): SupportedNFTProviders {
  if (contractType === "ERC721") {
    return new ERC721Provider(network);
  } else if (contractType === "ERC1155") {
    return new ERC1155Provider(network);
  }

  throw new Error(`Provider for ${contractType} contract type doesn't exist`);
}

export class NFTProviderManager {
  static #providers = new Map<string, SupportedNFTProviders>();

  private constructor() {
    // instantiated once as a singleton
  }

  static getProvider<N extends BlockchainNetwork, T extends EVMSupportedNFTContractType>(network: N, contractType: T) {
    const provider = NFTProviderManager.#providers.get(contractType);

    if (provider) {
      const providerConnections = provider.network.connections;

      const networkConnections = network.connections;

      if (isEqual(providerConnections, networkConnections)) {
        return provider;
      }
    }

    // If no provider is found, create one
    const newProvider = createProvider(network, contractType);

    // Otherwise store the newly created provider
    NFTProviderManager.#providers.set(contractType, newProvider);

    return newProvider;
  }
}
