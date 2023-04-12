import { ChainType } from "./common";

export interface NFTProviderClass<T extends ChainType = ChainType> {
  chainType: T;

  getTokenBalance(token: string, addressOfUser: string, tokenId: string): Promise<string>;

  belongsToUser(tokenAddress: string, addressOfUser: string, tokenId: string): Promise<boolean>;

  getHasMulticallSupport(): boolean;
}
