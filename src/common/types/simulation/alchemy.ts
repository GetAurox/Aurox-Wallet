export type SimulationResponse = ({ result: Result[] | Result } | { error: RequestError }) & {
  jsonrpc: string;
  id: number;
};

export interface Result {
  changes: Change[];
  gasUsed: string;
  error: TransactionError | null;
}

export interface RequestError {
  code: number;
  message: string;
}

export interface Change {
  assetType: string;
  changeType: "TRANSFER" | "APPROVE";
  from: string;
  to: string;
  rawAmount: string;
  contractAddress: string | null;
  tokenId: string | null;
  decimals: number;
  symbol: string;
  name: string;
  logo: string;
  amount: string;
}

export interface TransactionError {
  message: string;
}

export interface NFTMetadata {
  contract: Contract;
  id: ID;
  balance: string;
  title: string;
  description: string;
  tokenUri: TokenURI;
  media: Media;
  metadata: Metadata;
  timeLastUpdated: string;
  error: string;
  contractMetadata: ContractMetadata;
  spamInfo: SpamInfo;
}

export interface Contract {
  address: string;
}

export interface ContractMetadata {
  name: string;
  symbol: string;
  totalSupply: string;
  tokenType: string;
  contractDeployer: string;
  deployedBlockNumber: number;
  opensea?: Opensea;
}

export interface Opensea {
  floorPrice: number;
  collectionName: string;
  safelistRequestStatus: string;
  imageUrl: string;
  description: string;
  externalUrl: string;
  twitterUsername: string;
  discordUrl: string;
  lastIngestedAt: string;
}

export interface ID {
  tokenMetadata: TokenMetadata;
}

export interface TokenMetadata {
  tokenType: string;
}

export interface Media {
  raw: string;
  gateway: string;
  thumbnail: string;
  format: string;
  bytes: number;
}

export interface Metadata {
  image: string;
  external_url: string;
  background_color: string;
  name: string;
  description: string;
  attributes: Attribute[];
  media: Media[];
}

export interface Attribute {
  value: string;
  trait_type: string;
}

export interface SpamInfo {
  isSpam: string;
  classifications: string[];
}

export interface TokenURI {
  raw: string;
  gateway: string;
}
