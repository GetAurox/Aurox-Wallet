import { NetworkRequest } from "common/types/dapp/networkRequest";

import { BlockchainNetwork, BlockchainNetworkDefinition, ChainType } from "../types";

export function createNetworkIdentifier(chainType: ChainType, chainId: number) {
  return `${chainType}::${chainId}`;
}

export function getNetworkIdentifierFromDefinition(definition: BlockchainNetworkDefinition) {
  return `${definition.chainType}::${definition.chainId}`;
}

export function getNetworkDefinitionFromIdentifier(networkIdentifier: string): BlockchainNetworkDefinition {
  const [chainType, chainId] = networkIdentifier.split("::");

  const chainIdValue = Number(chainId);

  if (chainType && chainId && Number.isFinite(chainIdValue)) {
    return { chainType: chainType as ChainType, chainId: chainIdValue };
  }

  throw new Error(`Invalid network identifier provided: "${networkIdentifier}"`);
}

export function getBlockchainExplorerContractAddressLink(contractAddress: string, baseURL: string | null) {
  if (!baseURL) return null;

  try {
    return new URL(`/address/${contractAddress}`, baseURL).href;
  } catch {
    return null;
  }
}

export function getBlockchainExplorerTransactionLink(txHash: string, baseURL: string | null) {
  if (!baseURL) return null;

  try {
    return new URL(`/tx/${txHash}`, baseURL).href;
  } catch {
    return null;
  }
}

export function mapDAppNetworkRequestToBlockchainNetwork(request: NetworkRequest): BlockchainNetwork {
  const chainId = parseInt(request.chainId);

  const network = {
    chainId,
    identifier: createNetworkIdentifier("evm", chainId),
    shortName: request.chainName ?? "Not provided",
    name: request.chainName ?? "Not provided",
    disabled: false,
    deployment: "mainnet",
    currencySymbol: request.nativeCurrency?.symbol ?? "Not provided",
    chainType: "evm",
    connections: [],
    originalConnections: [],
    chainExplorer: null,
  } as BlockchainNetwork;

  if (request.blockExplorerUrls && request.blockExplorerUrls.length > 0) {
    const url = new URL(request.blockExplorerUrls[0]);

    network.chainExplorer = { name: url.hostname, baseURL: url.href };
  }

  if (request.rpcUrls && request.rpcUrls.length > 0) {
    network.connections = [{ url: request.rpcUrls[0] }];
  }

  return network;
}
