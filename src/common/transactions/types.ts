import { TransactionReceipt } from "@ethersproject/abstract-provider";

import { GasOptions } from "ui/types";
import { EVMFeeStrategy } from "ui/common/fee";

import { AccountInfo, BlockchainNetwork, EVMTransactionStatus, RawTransaction, SendTransactionMetadata } from "common/types";

export interface EVMTransactionServiceProps {
  transaction: RawTransaction;
  account: AccountInfo;
  network: BlockchainNetwork;
  userBalance: string;
  gasOptions: GasOptions;
}

type SendTransactionReturnType = Promise<{
  hash: string;
  waitForReceipt: () => Promise<TransactionReceipt>;
  getTransactionStatus: () => Promise<EVMTransactionStatus>;
}>;

export interface EVMTransactionService {
  feeStrategy: EVMFeeStrategy;
  sendTransaction: (metadata?: SendTransactionMetadata) => SendTransactionReturnType;
  cancelUpdate?: () => void;
}
