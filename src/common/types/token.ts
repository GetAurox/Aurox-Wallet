import { TransactionStatus } from "./transaction";

export type TokenTransactionSide = "receiver" | "sender" | "swap";

export interface TokenTransaction {
  date: string;
  nonce: number;
  txHash: string;
  title?: string;
  timestamp: number;
  valueUSD?: string | null;
  tokenAddress?: string;
  status?: TransactionStatus;
  networkIdentifier?: string;
  isCached?: boolean;
  gasless?: boolean;
}

export interface TokenTransactionDetails extends TokenTransaction {
  symbol?: string;
  gasLimit: string;
  gasPrice: string;
  txCost: string | null;
  amount: string | null;
  accountAddress: string;
  buyPrice: string | null;
  totalCost: string | null;
  secondSideAddress: string;
  side?: TokenTransactionSide;
  networkIdentifier: string;
}

export interface TokenApprovalItem {
  id: number;
  amount: string;
  address: string;
  fullName: string;
  shortName: string;
  approvedSpender: string;
  contractAddress: string;
}
