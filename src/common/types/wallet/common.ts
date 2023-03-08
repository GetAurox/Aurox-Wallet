import { SignTypedDataPayload, TransactionRequest } from "./transaction";

export type ChainType = "evm" | "solana" | "btc";

export type SignerType = "private-key" | "hardware";

export type HardwareSignerType = "trezor" | "ledger";

export type WalletSetupMethod = "create" | "import";

type HardwareSupportedOperation = "signMessage" | "signTransaction" | "signTypedData";

export interface HardwareOperationBase {
  accountUUID: string;
  device: HardwareSignerType;
  operationType: HardwareSupportedOperation;
  cancelled?: boolean;
  dappOperationId?: string;
}

export interface SignTransaction extends HardwareOperationBase {
  operationType: "signTransaction";
  transaction: TransactionRequest;
}

export interface SignMessage extends HardwareOperationBase {
  operationType: "signMessage";
  message: string;
}

export interface SignTypedData extends HardwareOperationBase {
  operationType: "signTypedData";
  typedData: SignTypedDataPayload;
}

export type HardwareOperation = SignTransaction | SignMessage | SignTypedData;
