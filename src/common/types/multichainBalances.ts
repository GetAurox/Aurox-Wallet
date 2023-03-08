export interface MultichainAccountBalanceInfo {
  assetIdentifier: string;
  balance: string;
  balanceUSDValue: string | null;
}

export interface MultichainNetworkBalances {
  networkIdentifier: string;
  hasUSDBalanceValues: boolean;
  totalPortfolioValueUSD: string | null;
  /**
   * Mapping from `assetIdentifier` to BalanceInfo.
   */
  balances: Record<string, MultichainAccountBalanceInfo>;
}

export interface MultichainAccountNetworkBalances {
  accountUUID: string;
  /**
   * Mapping from `networkIdentifier` to NetworkBalances.
   */
  networks: Record<string, MultichainNetworkBalances>;
}

/**
 * This represents the entire state tree for the balances:
 *
 * accountUUID -> networkIdentifier -> assetIdentifier -> BalanceInfo
 */
export type MultichainBalances = Record<string, MultichainAccountNetworkBalances>;
