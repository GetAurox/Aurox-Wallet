import { TransactionType } from "../types";

export interface FeeConfigurationLegacy<S> {
  type: TransactionType.Legacy;
  gasLimit: S;
  gasPrice: S;
}

export interface FeeSettings<S, T = FeeConfigurationLegacy<S>> {
  low: T;
  medium: T;
  high: T;
  custom: T | null;
}
