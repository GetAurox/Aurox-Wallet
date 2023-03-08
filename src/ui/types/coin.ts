export type GraphQLMarketsAPICoinQueryIdentificationType = "id" | "address";

interface GraphQLMarketsAPICoinIcons {
  /** `white(format: "svg"|"png")` */
  w: string | null;
  /** `black(format: "svg"|"png")` */
  b: string | null;
  /** `color(format: "svg"|"png")` */
  c: string | null;
}

export interface GraphQLMarketsAPICoinToken {
  /** The contract address in blockchain. */
  address: string;
  /** The internal identifier of asset in Aurox exchange data service API. */
  assetId: number;
  /** The internal identifier of pair in Aurox exchange data service API. */
  pairId: number;
  chainId: string;
}

export interface GraphQLMarketsAPIPriceHistory {
  /** Unix timestamp in milliseconds. `time(format: "unix"|"unix_ms"|"rfc3339")` */
  time: number;
  /** The price of coin in USD at the moment of 'time' field value. */
  price: string;
}

export type GraphQLMarketsAPISocialNetwork = "facebook" | "twitter" | "reddit" | "telegram" | "bitcointalk";

export interface GraphQLMarketsAPISocialAccount {
  /** The social network where account is created. */
  network: GraphQLMarketsAPISocialNetwork;
  /** The username in social network (optional). */
  username?: string;
  /** The link to social network profile page. */
  url: string;
}

export interface GraphQLMarketsAPICoin {
  /** The unique value of the coin. */
  id: string;
  /** The coin symbol. `shortName` */
  sn: string;
  /** The coin full name. `fullName` */
  fn: string;
  /** `icons` */
  i?: Partial<GraphQLMarketsAPICoinIcons> | null;
  /** The list of coin tags. `tags` */
  t: string[];
  /** The list of related tokens. */
  tokens: GraphQLMarketsAPICoinToken[];
  /** The current price of the coin in USD. `priceUSD` */
  p: string;
  /** The difference between the current price and the price 24 hours ago in USD. `priceUSDChange24H` */
  c24: string;
  /** The percentage difference between the current price and the price 24 hours ago. `priceChange24HPercent` */
  c24p: string;
  /** The difference between the current volume and the volume 24 hours ago. `volumeUSD24H` */
  v24: string;
  /** The number of coins that currently exists. `totalSupply` */
  ts: string;
  /** The number of coins that are publicly available and circulating in the market. `circulatingSupply` */
  cs: string;
  /** The market capitalization in USD. `marketCapUSD` */
  mc: string;
  /** The rank of the coin in the list of all coins. `rank` */
  r: number;
  /** The list of historical prices for last 24 hours. */
  priceHistory24H: GraphQLMarketsAPIPriceHistory[];
  /** The description text of the coin. `description` */
  d: string;
  /** The official websites and resources related to the coin. `links` */
  l: string[];
  /** Social network profile names and links. `socials` */
  s: GraphQLMarketsAPISocialAccount[];
}

export interface GraphQLMarketsAPICoinResponse {
  data: {
    coin: GraphQLMarketsAPICoin;
  };
}

export interface GraphQLMarketsAPICoinsResponse {
  data: {
    market: {
      coins: GraphQLMarketsAPICoin[];
    };
  };
}

export interface GraphQLMarketsAPIFavoriteCoinsResponse {
  data: Record<string, GraphQLMarketsAPICoin>;
}

export interface GraphQLMarketsAPITokenIconsResponse {
  data: Record<string, GraphQLMarketsAPICoin>;
}
