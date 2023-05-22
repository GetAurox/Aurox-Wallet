import { BigNumber } from "ethers";
import { FeeConfigurationEIP1559 } from "ui/common/fee/evm/EIP1559";
import { FeeConfigurationLegacy } from "ui/common/fee/evm/Legacy";

/**
 * @deprecated use EVMTransactionStatus instead, this status does not contain correct mapping to RPC status response
 * */
export type TransactionStatus = "completed" | "failed" | "pending" | "replaced" | "cancelled" | "timeout";

export enum EVMTransactionStatus {
  /** Matches RPC failed transaction status */
  Failed = 0,

  /** Matches RPC success transaction status */
  Completed = 1,

  // --- Non-standard custom fields ---
  Created = 100,
  Pending,
  Replaced,
  Cancelled,
  Timeout,
}

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type OptionalLegacyFeeConfiguration = Optional<FeeConfigurationLegacy<BigNumber>, "gasLimit" | "gasPrice" | "type">;
type OptionalEIP1559FeeConfiguration = Optional<
  FeeConfigurationEIP1559<BigNumber>,
  "gasLimit" | "maxFeePerGas" | "maxPriorityFeePerGas" | "baseFee" | "type"
>;

export interface SendTransactionMetadata {
  operationId?: string;
  nonce?: number;
  title?: string;
  message?: string;
  blockExplorerTxBaseURL?: string | null;
  recalculateFees?: boolean;
  feeOverride?: OptionalLegacyFeeConfiguration | OptionalEIP1559FeeConfiguration;
}
