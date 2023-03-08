import { BlockchainNetwork, MultichainNetworkBalances } from "common/types";

export interface MultichainBalanceResolutionQuery {
  network: BlockchainNetwork;
  accountAddress: string;
  assetIdentifiers: string[];
}

export type MultichainBalanceResolverType = "leecher" | "rpc";

export interface MultichainBalanceResolutionOperator {
  applyUpdate: (networkIdentifier: string, balances: MultichainNetworkBalances, resolverType: MultichainBalanceResolverType) => void;
  reportError: (query: MultichainBalanceResolutionQuery, error: Error) => void;
  signal?: AbortSignal;
}

export type MultichainBalanceResolver = {
  resolver: (abort?: AbortSignal) => Promise<MultichainNetworkBalances>;
  resolverType: MultichainBalanceResolverType;
};
