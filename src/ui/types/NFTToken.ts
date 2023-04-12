import { ChainType, ImportedAssetVisibility, NFTAssetDefinition, SupportedNFTContractType } from "common/types";

export type FlatNFTBalanceInfo = NFTAssetDefinition & {
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
  metadata: {
    tokenId: string;
    image: string | null;
  };
};

export type NFTInformationMetadata = {
  image: string | null;
  name: string;
  description: string;
  owner: string;
};

export type NFTInformation = {
  contractType: SupportedNFTContractType | null;
  metadata: null | NFTInformationMetadata;
};

export interface NFTTokenTrait {
  order?: any;
  value: string;
  max_value: number | null;
  trait_type: string;
  trait_count: number;
  display_type: string | null;
}

interface Asset {
  decimals: number;
  token_id: string;
}

interface ToAccount {
  user: User | null;
  config: string;
  address: string;
  profile_img_url: string;
}

interface User {
  username: string | null;
}

interface FromAccount {
  user: User;
  config: string;
  address: string;
  profile_img_url: string;
}

interface Transaction {
  id: number;
  timestamp: string;
  block_hash: string;
  to_account: ToAccount;
  block_number: string;
  from_account: FromAccount;
  transaction_hash: string;
  transaction_index: string;
}

interface PaymentToken {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  eth_price: string;
  image_url: string;
  usd_price: string;
}

interface LastSale {
  asset: Asset;
  quantity: string;
  event_type: string;
  total_price: string;
  transaction: Transaction;
  asset_bundle?: any;
  auction_type: string | null;
  created_date: string;
  payment_token: PaymentToken;
  event_timestamp: string;
}

interface Owner {
  user: User;
  config: string;
  address: string;
  profile_img_url: string;
}

interface TopOwnership {
  owner: Owner;
  quantity: string;
}

interface Metadata {
  orders?: any;
  is_nsfw: boolean;
  top_bid?: any;
  auctions: any[];
  decimals: number;
  image_url: string;
  last_sale: LastSale | null;
  num_sales: number;
  ownership?: any;
  permalink: string;
  is_presale: boolean;
  description: string | null;
  sell_orders?: any;
  listing_date: string | null;
  transfer_fee: number | null;
  animation_url: string | null;
  external_link: string | null;
  related_assets: any[];
  token_metadata: string;
  top_ownerships: TopOwnership[];
  supports_wyvern: boolean;
  background_color: string | null;
  image_preview_url: string;
  image_original_url: string;
  image_thumbnail_url: string;
  animation_original_url: string | null;
  highest_buyer_commitment: string | null;
  transfer_fee_payment_token: number | null;
}

export interface GraphQLMarketsNFTToken {
  id: string;
  name: string;
  contractAddress: string;
  tokenId: string;
  contractName: string;
  contractSymbol: string;
  contractOwner: string;
  collectionName: string;
  collectionSlug: string;
  ownerUsername: string | null;
  ownerAddress: string;
  creatorAddress: string;
  creatorUsername: User | null;
  traits: NFTTokenTrait[];
  metadata: Metadata;
  misc: string | null;
}

export interface GraphQLMarketsNFTTokensResponse {
  asset: GraphQLMarketsNFTToken[];
}

export interface GraphQLMarketsNFTTokenResponse {
  data: GraphQLMarketsNFTToken[];
}
