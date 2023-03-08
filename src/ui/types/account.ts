import { EthereumAccountNFTTransfer, EthereumAccountTokenContractType, EthereumToken, SupportedNetworkIdentifier } from "ui/types";

export type BalanceOHLCV = {
  /**
   * Start time of the OHLCV interval.
   */
  timeStart: number;

  /**
   * Time of the first transaction in this OHLCV interval.
   */
  timeOpen: number;

  /**
   * Time in this OHLCV interval when the balance had the lowest value.
   */
  timeLow: number;

  /**
   * Time in this OHLCV interval when the balance had the highest value.
   */
  timeHigh: number;

  /**
   * Time of the last transaction in this OHLCV interval.
   */
  timeClose: number;

  /**
   * The balance value after the first transaction in this OHLCV interval.
   */
  valueOpen: number;

  /**
   * The lowest balance value in this OHLCV interval.
   */
  valueLow: number;

  /**
   * The highest balance value in this OHLCV interval.
   */
  valueHigh: number;

  /**
   * The balance value after the last transaction in this OHLCV interval.
   */
  valueClose: number;

  /**
   * The total number of transactions in this OHLCV interval.
   */
  transactions: number;
};

export type EthereumAccountNFT = {
  /**
   * The account address.
   */
  accountAddress: string;

  /**
   * The NFT token contract address.
   */
  tokenAddress: string;

  /**
   * The token contract standard/type.
   */
  tokenContractType: EthereumAccountTokenContractType;

  /**
   * The token information.
   */
  token: EthereumToken;

  /**
   * The NFT token identifier.
   */
  tokenId: string;

  /**
   * The NFT metadata information. Might be `null`
   */
  metadata: NFTMetadata | null;

  timestamp: number;
  blockNumber: number;
  txIndex: number;
  logIndex: number;
};

export type NFTMetadata = {
  /**
   * The unique value of the NFT.
   */
  id: string;

  /**
   * The NFT name.
   */
  name?: string;

  /**
   * The NFT contract name.
   */
  contractName: string;

  /**
   * The NFT contract symbol.
   */
  contractSymbol: string;

  /**
   * The NFT contract owner.
   */
  contractOwner: string;

  /**
   * The NFT collection name.
   */
  collectionName: string;

  /**
   * The NFT collection slug.
   */
  collectionSlug: string;

  /**
   * The NFT owner username.
   */
  ownerUsername: string;

  /**
   * The NFT owner address.
   */
  ownerAddress: string;

  /**
   * The NFT creator username.
   */
  creatorUsername: string;

  /**
   * The NFT creator address.
   */
  creatorAddress: string;

  /**
   * The NFT description.
   */
  description: string;

  /**
   * The NFT image url.
   */
  imageUrl: string;

  /**
   * The NFT traits.
   */
  traits: NFTTrait[];

  /**
   * Tells if the NFT collection is verified.
   */
  collectionVerified: string;
};

export type NFTTrait = {
  /**
   * The trait value.
   */
  value: string;

  /**
   * The trait type.
   */
  type: string;

  /**
   * The trait count.
   */
  count: number;

  /**
   * The trait rarity percentage.
   */
  traitPercentage: number;

  /**
   * The trait display type.
   */
  displayType: string;
};

export interface GraphQLEthereumAccountHistoricalBalanceQuery {
  /**
   * Historical total value of the account in USD.
   * It's possible to request historical USD value filtered by specific tokenAddress.
   * To filter by native ETH token need to pass 'tokenAddress:"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"'.
   */
  valueUSD: BalanceOHLCV[];
  /**
   * Historical account balance of native ETH token.
   */
  ETH: BalanceOHLCV[];
  /**
   * Historical account balance of the specific token.
   */
  token: BalanceOHLCV[];
}

export interface GraphQLEthereumAccountHistoricalBalanceValueUSDResponse {
  data: {
    ethereum: {
      account: {
        historicalBalance: {
          valueUSD: {
            time: number;
            value: string;
          }[];
        };
      };
    };
  };
}

export interface GraphQLEthereumAccountBalanceResponse {
  data: {
    ethereum: {
      account: {
        balance: {
          valueUSD: string;
          root: { amount: string; valueUSD: string | null };
          tokens: {
            amount: string;
            valueUSD: string | null;
            token: {
              address: string;
              symbol: string;
            };
          }[];
        };
      };
    };
  };
}

export interface GraphQLEthereumAccountNFTsBalanceResponse {
  data: {
    ethereum: {
      account: {
        balance: {
          nftTokens: EthereumAccountNFT[];
        };
      };
    };
  };
}

export interface GraphQLEthereumAccountNFTsTransactionsResponse {
  data: {
    ethereum: {
      account: {
        transactions: {
          nftTransfers: EthereumAccountNFTTransfer[];
        };
      };
    };
  };
}

export interface NormalizedToken {
  name?: string;
  symbol?: string;
  balance?: string;
  balanceUSD?: string;
  address: string;
  decimals?: number;
  accountAddress?: string;
  icons?: Partial<Record<"white" | "black" | "color", string>>;
  protocol?: string;
  pairId?: number;
  price?: string;
  change24Percent?: string;
  networkIdentifier: string;
  imported?: boolean;
}

// TODO: This naming is not good
export interface TokenMarketData {
  sn: string;
  fn: string;
  i: string | null;
  p: string;
  c24p: string;
  a: string;
  n: SupportedNetworkIdentifier;
  pi: number;
}

export interface AccountTokenData {
  accountAddress: string;
  amount: string;
  value: string;
  token: {
    address: string;
    networkId: SupportedNetworkIdentifier;
    name: string;
    symbol: string;
    decimals: number;
    contractType: string;
    price?: string;
  };
}
