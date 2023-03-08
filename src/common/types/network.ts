import { ChainType } from "./wallet/common";

export type BlockchainNetworkDeployment = "mainnet" | "testnet" | "local";

export interface BlockchainNetworkExplorer {
  name: string;
  baseURL: string;
}

export interface BlockchainNetworkConnection {
  url: string;
}

export interface BlockchainNetworkDefinition {
  chainType: ChainType;
  chainId: number;
}

export interface BlockchainNetwork extends BlockchainNetworkDefinition {
  identifier: string;
  name: string;
  shortName: string;
  currencySymbol: string;
  chainExplorer: BlockchainNetworkExplorer | null;
  deployment: BlockchainNetworkDeployment;
  connections: BlockchainNetworkConnection[];
  originalConnections: BlockchainNetworkConnection[];
  disabled: boolean;
  testnet?: boolean;
}

export type BlockchainNetworkUpdate = Partial<
  Pick<BlockchainNetwork, "name" | "currencySymbol" | "chainExplorer" | "connections" | "chainId" | "disabled">
>;
