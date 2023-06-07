import { useMemo } from "react";
import orderBy from "lodash/orderBy";
import partition from "lodash/partition";

import { BlockchainNetwork } from "common/types";
import {
  ARBITRUM_CHAIN_ID,
  AVALANCHE_CHAIN_ID,
  BINANCE_SMART_CHAIN_CHAIN_ID,
  ETHEREUM_MAINNET_CHAIN_ID,
  OPTIMISM_CHAIN_ID,
  POLYGON_CHAIN_ID,
} from "common/config";

export function useOrderedNetworks(networks: BlockchainNetwork[]): BlockchainNetwork[] {
  return useMemo(() => {
    const chainIdsOfTopNetworks = [
      ETHEREUM_MAINNET_CHAIN_ID,
      BINANCE_SMART_CHAIN_CHAIN_ID,
      POLYGON_CHAIN_ID,
      AVALANCHE_CHAIN_ID,
      ARBITRUM_CHAIN_ID,
      OPTIMISM_CHAIN_ID,
    ];

    const [topNetworks, otherNetworks] = partition(networks, network => chainIdsOfTopNetworks.includes(network.chainId));

    return [
      ...orderBy(topNetworks, network => chainIdsOfTopNetworks.indexOf(network.chainId), ["asc"]),
      ...orderBy(otherNetworks, [network => !network.disabled, network => network.name], ["desc", "asc"]),
    ];
  }, [networks]);
}
