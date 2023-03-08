import { BlockchainNetwork } from "common/types";
import { ProviderManager } from "common/wallet";

import type { RPCHookResolver } from "./common";

async function resolveTokenMetadata(network: BlockchainNetwork, contractAddress: string) {
  const provider = ProviderManager.getProvider(network);

  const { symbol, name, decimals } = await provider.getTokenDetails(contractAddress);

  return { symbol, name, decimals };
}

const resolver: RPCHookResolver = { resolveTokenMetadata };

export default resolver;
