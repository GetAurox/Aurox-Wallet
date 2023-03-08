import { BlockchainNetwork, ChainType } from "common/types";

import evm from "./evm";
import btc from "./btc";
import solana from "./solana";

export interface RPCTokenMetadata {
  decimals: number;
  symbol: string;
  name: string;
}

export interface RPCHookResolver {
  resolveTokenMetadata(network: BlockchainNetwork, contractAddress: string): Promise<RPCTokenMetadata | null>;
}

export const resolvers: Record<ChainType, RPCHookResolver> = {
  "evm": evm,
  "btc": btc,
  "solana": solana,
};
