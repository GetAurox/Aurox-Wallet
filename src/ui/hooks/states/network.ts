import { useCallback } from "react";

import { PublicNetworkState } from "common/states";
import { BlockchainNetwork } from "common/types";

import { getBlockchainExplorerContractAddressLink, getBlockchainExplorerTransactionLink } from "common/utils";

import { makeConsumerReadyAsserterHook, makeStateConsumerHook } from "../utils";

export const useNetworkState = makeStateConsumerHook(PublicNetworkState.buildConsumer());

export const useNetworkStateAssertReady = makeConsumerReadyAsserterHook(useNetworkState);

export type NetworkGetter = (networkIdentifier: string | undefined | null) => BlockchainNetwork | null;

export function useNetworks() {
  return useNetworkState(networksSelector);
}

export function useEnabledNetworks() {
  return useNetworkState(enabledNetworksSelector);
}

export function useTestnetNetworks() {
  return useNetworkState(testnetNetworksSelector);
}

export function useNetworkByIdentifier(targetNetworkIdentifier: string | null | undefined) {
  const selector = useCallback(
    (data: PublicNetworkState.Data) => data?.networks?.find(({ identifier }) => identifier === targetNetworkIdentifier) ?? null,
    [targetNetworkIdentifier],
  );

  return useNetworkState(selector);
}

export function useNetworkGetter(): NetworkGetter {
  const mapping = useNetworkState(networkMappingSelector);

  return useCallback(
    (networkIdentifier: string | undefined | null) => {
      if (!networkIdentifier) return null;

      return mapping?.get(networkIdentifier) ?? null;
    },
    [mapping],
  );
}

export function useNetworkBlockchainExplorerLinkResolver(targetNetworkIdentifier: string | null | undefined) {
  const selector = useCallback(
    (data: PublicNetworkState.Data) =>
      data?.networks?.find(({ identifier }) => identifier === targetNetworkIdentifier)?.chainExplorer?.baseURL ?? null,
    [targetNetworkIdentifier],
  );

  const baseURL = useNetworkState(selector);

  const getContractAddressExplorerLink = useCallback(
    (contractAddress: string) => getBlockchainExplorerContractAddressLink(contractAddress, baseURL),
    [baseURL],
  );

  const getTransactionExplorerLink = useCallback((txHash: string) => getBlockchainExplorerTransactionLink(txHash, baseURL), [baseURL]);

  return { getContractAddressExplorerLink, getTransactionExplorerLink };
}

const networksSelector = (data: PublicNetworkState.Data) => data?.networks.filter(network => network.testnet !== true) ?? null;
const enabledNetworksSelector = (data: PublicNetworkState.Data) =>
  data?.networks.filter(network => !network.disabled && network.testnet !== true) ?? null;
const testnetNetworksSelector = (data: PublicNetworkState.Data) => data?.networks.filter(network => network.testnet) ?? null;

const networkMappingSelector = (data: PublicNetworkState.Data) => new Map(data?.networks?.map(network => [network.identifier, network]));
