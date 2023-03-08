interface PrimaryAssetContract {
  name: string;
  owner: number;
  symbol: string;
  address: string;
  image_url: string;
  description: string;
  nft_version: string;
  schema_name: string;
  created_date: string;
  total_supply: string;
  external_link: string;
  payout_address: string;
  default_to_fiat: boolean;
  opensea_version?: any;
  asset_contract_type: string;
  buyer_fee_basis_points: number;
  only_proxied_transfers: boolean;
  seller_fee_basis_points: number;
  dev_buyer_fee_basis_points: number;
  dev_seller_fee_basis_points: number;
  opensea_buyer_fee_basis_points: number;
  opensea_seller_fee_basis_points: number;
}

interface Stats {
  count: number;
  market_cap: number;
  num_owners: number;
  floor_price: number;
  num_reports: number;
  total_sales: number;
  total_supply: number;
  total_volume: number;
  average_price: number;
  one_day_sales: number;
  one_day_change: number;
  one_day_volume: number;
  seven_day_sales: number;
  seven_day_change: number;
  seven_day_volume: number;
  thirty_day_sales: number;
  thirty_day_change: number;
  thirty_day_volume: number;
  one_day_average_price: number;
  seven_day_average_price: number;
  thirty_day_average_price: number;
}

interface DisplayData {
  card_display_style: string;
}

interface PaymentToken {
  id: number;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  eth_price: number;
  image_url: string;
  usd_price: number;
}

interface Metadata {
  stats: Stats;
  hidden: boolean;
  traits: Record<string, Record<string, number>>;
  editors: string[];
  is_nsfw: boolean;
  chat_url?: any;
  featured: boolean;
  wiki_url?: any;
  image_url: string;
  description: string;
  discord_url: string;
  created_date: Date;
  display_data: DisplayData;
  external_url: string;
  telegram_url?: any;
  require_email: boolean;
  payment_tokens: PaymentToken[];
  payout_address: string;
  default_to_fiat: boolean;
  large_image_url: string;
  medium_username?: any;
  banner_image_url: string;
  twitter_username: string;
  short_description?: any;
  featured_image_url: string;
  instagram_username?: any;
  only_proxied_transfers: boolean;
  is_subject_to_whitelist: boolean;
  safelist_request_status: string;
  dev_buyer_fee_basis_points: string;
  dev_seller_fee_basis_points: string;
  opensea_buyer_fee_basis_points: string;
  opensea_seller_fee_basis_points: string;
}

export interface GraphQLMarketsNFTCollection {
  slug: string;
  name: string;
  primaryAssetContracts: PrimaryAssetContract[];
  metadata: Metadata;
  misc?: any;
}

export interface GraphQLMarketsNFTCollectionResponse {
  collection: GraphQLMarketsNFTCollection;
}
