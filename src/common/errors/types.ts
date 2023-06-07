import { BigNumber } from "@ethersproject/bignumber";

export interface NestedEthersError {
  code?: string | number;
  message?: string;
  data?: {
    message?: string;
  };
  error?: {
    error?: {
      code?: string | number;
    };
    body?: string;
  };
}

export interface EthersRPCError {
  code?: string | number;
  message: string;
  error?: NestedEthersError;
  operation?: string;
  transaction?: {
    gasLimit: BigNumber;
    nonce: number;
  };
  receipt?: {
    gasUsed: BigNumber;
  };
  action?: string;
  reason?: string;
}
