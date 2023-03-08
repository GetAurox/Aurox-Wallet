import { BlockchainNetwork } from "common/types";
import { createNetworkIdentifier } from "common/utils";

export const mockEthereumNetwork: BlockchainNetwork = {
  identifier: createNetworkIdentifier("evm", 1),
  name: "Ethereum",
  shortName: "Ethereum",
  currencySymbol: "ETH",
  chainId: 1,
  chainType: "evm",
  deployment: "mainnet",
  disabled: false,
  chainExplorer: {
    name: "Etherscan",
    baseURL: "https://etherscan.io",
  },
  connections: [
    {
      url: "https://eth-mainnet.g.alchemy.com/v2/bYiYTFqsDKMe0iuVrL-1RKE1dfAMSzNp",
    },
    {
      url: "https://rpc.ankr.com/eth",
    },
    {
      url: "https://cloudflare-eth.com",
    },
  ],
  originalConnections: [
    {
      // Requires the open Infura project Id for this to work
      url: "https://mainnet.infura.io/v3/84842078b09946638c03157f83405213",
    },
    {
      url: "https://rpc.ankr.com/eth",
    },
    {
      url: "https://cloudflare-eth.com",
    },
  ],
};
