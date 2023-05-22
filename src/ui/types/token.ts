import { AssetDefinition, BlockchainNetworkDefinition, ChainType, ImportedAssetVisibility } from "common/types";

import { GraphQLMarketsAPICoinToken } from "./coin";

export type FlatTokenBalanceInfo = AssetDefinition & {
  key: string;
  networkIdentifier: string;
  assetIdentifier: string;
  chainType: ChainType;
  chainId: number;
  visibility: ImportedAssetVisibility;
  verified: boolean;
  autoImported: boolean;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUSDValue: string | null;
  metadata?: {
    tokenId: string;
    image: string | null;
    updatedAt: number | null;
  };
};

export interface TokenIdentity {
  key: string;
  assetIdentifier: string;
  networkIdentifier: string;
  assetDefinition: AssetDefinition;
  networkDefinition: BlockchainNetworkDefinition;
}

export interface TokenDisplay extends TokenIdentity {
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUSDValue: string | null;
  visibility: ImportedAssetVisibility;
  verified: boolean;
  autoImported: boolean;
  /**
   * used to pass props directly to <img> (alt and src)
   */
  img: {
    alt?: string;
    src?: string;
  };
}

export interface TokenTicker extends TokenIdentity {
  pairId: number | null;
  priceUSD: string | null;
  priceChange24HPercent: string | null;
  priceUSDChange24H: string | null;
  volumeUSD24H: string | null;
}

export type TokenDisplayWithTicker = TokenDisplay & TokenTicker;

export type TokenSwapDetails = Omit<TokenDisplay, "balance" | "balanceUSDValue">;

export type TokenMarketDetailsSocialNetwork = "facebook" | "twitter" | "reddit" | "telegram" | "bitcointalk";

export interface TokenMarketDetailsSocial {
  network: TokenMarketDetailsSocialNetwork;
  username?: string;
  url: string;
}

export interface TokenMarketDetails {
  tags: string[];
  totalSupply: string;
  circulatingSupply: string;
  marketCapUSD: string;
  rank: number;
  description: string;
  links: string[];
  socials: TokenMarketDetailsSocial[];
}

export interface GraphQLMarketsAPITokensResponse {
  data: {
    market: {
      tokens: GraphQLMarketsAPICoinToken[];
    };
  };
}
