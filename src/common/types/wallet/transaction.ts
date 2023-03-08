import { MessageTypes, TypedMessage } from "@metamask/eth-sig-util";
import type { TransactionBlockhashCtor, TransferParams, TransferWithSeedParams } from "@solana/web3.js";

import { AccessListish } from "ethers/lib/utils";

import { ChainType } from "./common";

export interface TransactionRequest {
  to?: string;
  from: string;
  nonce: number;

  gasLimit: string;
  gasPrice?: string;

  data: string;
  value: string;
  chainId: number;

  type: number;
  accessList?: AccessListish;

  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;

  customData?: Record<string, any>;
  ccipReadEnabled?: boolean;
}

export interface SignMessageData {
  chainType: ChainType;
  uuid: string;
  message: string;

  dappOperationId?: string;
  // Indicates that message should be signed without the "\x19 Ethereum Signed Message" prefix
  unsafeWithoutPrefix?: boolean;
  // Indicates that message should be converted to Uint8Array before signing
  shouldArrayify?: boolean;
}

export type SignTypedDataPayload = TypedMessage<MessageTypes>;

export type EVMTransactionPayload = { type: "evm"; params: TransactionRequest };
export type SolanaTransactionPayload = { type: "solana"; params: TransferParams | TransferWithSeedParams; opts?: TransactionBlockhashCtor };

export type TransactionPayload = EVMTransactionPayload | SolanaTransactionPayload;

export type TransactionPayloadFromType<T extends ChainType> = Extract<TransactionPayload, { type: T }>;
