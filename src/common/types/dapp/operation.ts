import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";

import { BlockchainNetwork } from "../network";
import { SignTypedDataPayload } from "../wallet";

import { DAppPermissions } from "./permissions";

/**
 * Represents raw DApp transaction payload
 */
export interface RawTransaction {
  /** Indicates selected connected account address */
  from: string;

  /** To which contract the call is being made */
  to: string;

  /** Raw transaction data */
  data: string;

  /** Amount of ETH sent with transaction */
  value: string;
}

export type OperationType = Operation["operationType"];

export type OperationResponse = DAppPermissions | string[] | string | null;

interface OperationBase {
  id: string;
  tabId: number;
  domain: string;
  documentTitle: string;
  operationType: OperationType;
}

export interface OperationConnect extends OperationBase {
  operationType: "connect";

  considerOtherProvider: boolean;

  isDefaultProvider: boolean;

  preferredNetworkIdentifier?: string;
}

export interface OperationTransact extends OperationBase {
  operationType: "transact";

  networkIdentifier: string;

  accountUUID: string;

  transactionPayload: RawTransaction;

  contractABI?: string | undefined;

  isSimulated?: boolean;
}

export interface OperationAddNetwork extends OperationBase {
  operationType: "add_network";

  network: BlockchainNetwork;
}

export interface OperationEnableNetwork extends OperationBase {
  operationType: "enable_network";

  network: BlockchainNetwork;
}

export interface OperationSimpleSign extends OperationBase {
  // These are 2 distinct signing strategies. personal_sign will prefix the provided message
  // with \x19Ethereum Signed Message, whereas eth_sign won't.
  // eth_sign is more dangerous and will have additional warnings
  operationType: "personal_sign" | "eth_sign";

  accountUUID: string;

  networkIdentifier: string;

  // Simple signing request to sign a string message
  message: string;
}

/**
 * These fields come from the EIP712 specification which can be found here: https://eips.ethereum.org/EIPS/eip-712
 */
export interface OperationSignTypedData extends OperationBase {
  operationType: "signTypedData";

  accountUUID: string;
  networkIdentifier: string;

  typedData: SignTypedDataPayload;
}

export type Operation =
  | OperationConnect
  | OperationTransact
  | OperationSimpleSign
  | OperationSignTypedData
  | OperationAddNetwork
  | OperationEnableNetwork;
