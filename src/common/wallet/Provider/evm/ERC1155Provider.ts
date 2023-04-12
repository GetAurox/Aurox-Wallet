import { BlockchainNetwork, NFTProviderClass } from "common/types";

import { ERC1155__factory } from "common/wallet/typechain/factories/ERC1155__factory";

import { ERC1155_INTERFACE_ID } from "common/config";

import { JsonRPCProviderWithRetry } from "./JsonRPCProviderWithRetry";

export class ERC1155Provider implements NFTProviderClass<"evm"> {
  public chainType: "evm" = "evm";

  public readonly network: BlockchainNetwork;
  public readonly provider: JsonRPCProviderWithRetry;

  constructor(network: BlockchainNetwork) {
    this.network = network;
    this.provider = new JsonRPCProviderWithRetry(network);
  }

  async getTokenBalance(tokenAddress: string, addressOfUser: string, tokenId: string): Promise<string> {
    const token = ERC1155__factory.connect(tokenAddress, this.provider);

    const userBalance = await token.balanceOf(addressOfUser, tokenId);

    return userBalance.toString();
  }

  async belongsToUser(tokenAddress: string, addressOfUser: string, tokenId: string): Promise<boolean> {
    const token = ERC1155__factory.connect(tokenAddress, this.provider);

    const supports = await token.supportsInterface(ERC1155_INTERFACE_ID);

    if (supports) {
      const userBalance = await token.balanceOf(addressOfUser, tokenId);

      return userBalance.gt(0);
    }

    return false;
  }

  getHasMulticallSupport() {
    return this.provider.multicallContractAddress !== null;
  }
}
