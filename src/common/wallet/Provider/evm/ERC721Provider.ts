import { BlockchainNetwork, NFTProviderClass } from "common/types";

import { ERC721__factory } from "common/wallet/typechain/factories/ERC721__factory";

import { ERC721_INTERFACE_ID } from "common/config";

import { JsonRPCProviderWithRetry } from "./JsonRPCProviderWithRetry";

export class ERC721Provider implements NFTProviderClass<"evm"> {
  public chainType: "evm" = "evm";

  public readonly network: BlockchainNetwork;
  public readonly provider: JsonRPCProviderWithRetry;

  constructor(network: BlockchainNetwork) {
    this.network = network;
    this.provider = new JsonRPCProviderWithRetry(network);
  }

  async getTokenBalance(tokenAddress: string, addressOfUser: string, tokenId: string): Promise<string> {
    if (await this.belongsToUser(tokenAddress, addressOfUser, tokenId)) {
      return "1";
    }

    return Promise.resolve("0");
  }

  async belongsToUser(tokenAddress: string, addressOfUser: string, tokenId: string): Promise<boolean> {
    const token = ERC721__factory.connect(tokenAddress, this.provider);

    const supports = await token.supportsInterface(ERC721_INTERFACE_ID);

    if (supports) {
      const owner = await token.ownerOf(tokenId);

      return owner.toLowerCase() === addressOfUser.toLowerCase();
    }

    return false;
  }

  getHasMulticallSupport() {
    return this.provider.multicallContractAddress !== null;
  }
}
