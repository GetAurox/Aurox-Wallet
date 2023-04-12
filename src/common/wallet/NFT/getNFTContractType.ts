import { withRetry } from "common/utils";

import { BlockchainNetwork, EVMSupportedNFTContractType } from "common/types";

import { NFTProviderManager } from "common/wallet/Provider";

export async function getNFTContractType(
  tokenAddress: string,
  address: string,
  tokenId: string,
  network: BlockchainNetwork,
): Promise<EVMSupportedNFTContractType | null> {
  const result = await withRetry(async () => {
    const ERC721Provider = NFTProviderManager.getProvider(network, "ERC721");

    const ERC1155Provider = NFTProviderManager.getProvider(network, "ERC1155");

    const [belongsToERC721, belongsToERC1155] = await Promise.all([
      ERC721Provider.belongsToUser(tokenAddress, address, tokenId),
      ERC1155Provider.belongsToUser(tokenAddress, address, tokenId),
    ]);

    return belongsToERC721 || belongsToERC1155 ? (belongsToERC721 ? "ERC721" : "ERC1155") : null;
  });

  if (result.failed) {
    throw new Error(result.errors?.[0].message);
  }

  return result.result;
}
