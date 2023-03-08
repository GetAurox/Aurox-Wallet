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

export interface SendTransactionMetadata {
  title?: string;
  message?: string;
  blockExplorerTxBaseURL?: string | null;
}
