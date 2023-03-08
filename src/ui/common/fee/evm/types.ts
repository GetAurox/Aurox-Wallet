import { EVMFeeConfiguration } from "./base";

export type EVMFeePreference = "low" | "medium" | "high" | "custom";

export type EVMFeeSettings<T extends EVMFeeConfiguration | null> = {
  low: T;
  medium: T;
  high: T;
  custom: T;
};

export enum TransactionType {
  Legacy = 0,
  EIP1559 = 2,
}
