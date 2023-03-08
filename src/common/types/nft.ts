import { EthereumAccountTokenContractType } from "ui/types";

export type NFTStatus = "bought" | "sold" | "pending";

export type NFTNetwork = "ERC721" | "BEP2" | "BEP20";

export interface NFTItem {
  id: string;
  artistName: string;
  status: NFTStatus;
  networkIdentifier: string;
  name: string;
  icon?: string;
  symbol: string;
  decimals: number;
  tokenId: string;
  tokenAddress: string;
  accountAddress: string;
  tokenContractType: EthereumAccountTokenContractType;
}

export interface NFTToken {
  id: string;
  image: string;
  altText: string;
  peaceName: string;
  collectionName: string;
  icon: string;
  preferredNetwork: string;
  transactionId: string;
  price: number;
  priceUSD: string;
  priceChangeValue: string;
  priceChange: string;
}

export interface NFTTokenTrait {
  name: string;
  propertyItem: string;
  value: number;
}

export interface NFTTokenLevel {
  name: string;
  value: number;
  maxValue: number;
}

export interface NFTTokenStat {
  name: string;
  value: number;
  maxValue: number;
}
