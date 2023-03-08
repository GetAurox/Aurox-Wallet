import { HardwareSignerAccountInfo, SignTypedDataPayload, TransactionRequest } from "common/types";

export interface HardwareServiceBase {
  /** Close connection with hardware device */
  close(): Promise<void>;

  signTransaction(account: HardwareSignerAccountInfo, transaction: TransactionRequest): Promise<string>;

  signMessage(account: HardwareSignerAccountInfo, message: string): Promise<string>;

  signTypedData(account: HardwareSignerAccountInfo, typedData: SignTypedDataPayload): Promise<string>;
}
