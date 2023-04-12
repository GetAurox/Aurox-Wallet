import { Wallet } from "common/operations";
import { HardwareSignerAccountInfo, SignTypedDataPayload, TransactionRequest } from "common/types";
import { HdPath } from "common/wallet";

export interface HardwareServiceBase {
  /** Close connection with hardware device */
  close(): Promise<void>;

  getMultipleAddresses(startIndex: number, numAddresses: number, hdPath: HdPath): Promise<Wallet.ImportHardwareSigner.Data[]>;

  signTransaction(account: HardwareSignerAccountInfo, transaction: TransactionRequest): Promise<string>;

  signMessage(account: HardwareSignerAccountInfo, message: string): Promise<string>;

  signTypedData(account: HardwareSignerAccountInfo, typedData: SignTypedDataPayload): Promise<string>;
}
