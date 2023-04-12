import { ethers } from "ethers";
import { FetchWrapper, FetcherDeclaration } from "use-nft";

import { JsonRPCProviderWithRetry } from "common/wallet/Provider/evm/JsonRPCProviderWithRetry";
import { BlockchainNetwork } from "common/types";
import { withRetry } from "common/utils";

import { NFTInformationMetadata } from "ui/types";

export async function getNFTMetadata(tokenAddress: string, tokenId: string, network: BlockchainNetwork): Promise<NFTInformationMetadata> {
  const result = await withRetry(async () => {
    const fetcher: FetcherDeclaration = [
      "ethers",
      {
        provider: new JsonRPCProviderWithRetry(network),
        ethers: {
          Contract: ethers.Contract,
        },
      },
    ];

    const fetchWrapper = new FetchWrapper(fetcher);

    const metadata = await fetchWrapper.fetchNft(tokenAddress, tokenId);

    return {
      image: metadata.image,
      name: metadata.name,
      owner: metadata.owner,
      description: metadata.description,
    };
  });

  if (result.failed) {
    return { name: "", description: "", owner: "", image: null };
  }

  return result.result;
}
