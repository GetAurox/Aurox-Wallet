import { BigNumber } from "ethers";
import { TransactionType } from "../types";

export interface FeeConfigurationEIP1559<S> {
  type: TransactionType.EIP1559;
  maxFeePerGas: S;
  maxPriorityFeePerGas: S;
  baseFee: S;
  gasLimit: S;
}

export interface MaxPriorityFeePerGasMap {
  low: BigNumber;
  medium: BigNumber;
  high: BigNumber;
}

export interface FeeSettings<S, T = FeeConfigurationEIP1559<S>> {
  low: T;
  medium: T;
  high: T;
  custom: T | null;
}

export interface FeeHistory {
  baseFeePerGas: string[];
  gasUsedRation: number[];
  oldestBlock: string;
  reward: string[][];
}
