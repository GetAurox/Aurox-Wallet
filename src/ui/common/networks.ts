import { BlockchainNetwork } from "common/types";

export const initialBlockchainNetworkValues: BlockchainNetwork = {
  identifier: "",
  name: "",
  shortName: "",
  currencySymbol: "",
  chainId: -1,
  chainExplorer: null,
  deployment: "mainnet",
  chainType: "evm",
  disabled: false,
  connections: [],
  originalConnections: [],
};
