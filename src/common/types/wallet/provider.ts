import { EthereumToken } from "ui/types";

import { ChainType } from "./common";

export interface ProviderClass<T extends ChainType = ChainType> {
  chainType: T;

  getHasMulticallSupport(): boolean;

  getNetworkFeeData(): Promise<{ baseFee: string }>;

  getTokenBalance(token: string, addressOfUser: string): Promise<string>;

  getTokenDetails(token: string): Promise<EthereumToken>;

  getCode(address: string): Promise<string>;

  lookupAddress(address: string): Promise<string | null>;
}
