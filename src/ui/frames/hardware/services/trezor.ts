import { ethers } from "ethers";

import range from "lodash/range";
import omit from "lodash/omit";

import TrezorConnect, { EthereumTransaction, EthereumTransactionEIP1559 } from "@trezor/connect-web";

import { HardwareSignerAccountInfo, SignTypedDataPayload, TransactionRequest } from "common/types";
import { getEVMSignerPath, HdPath } from "common/wallet";
import { HardwarePathResult } from "common/wallet/helpers/types";

import { HardwareServiceBase } from "./base";

export class TrezorService implements HardwareServiceBase {
  #initialized = false;

  private static _initialized = false;

  private constructor() {
    this.#initialized = true;
  }

  static async initialize() {
    if (this._initialized) {
      throw new Error("Trezor service is already running");
    }

    await TrezorConnect.init({
      manifest: {
        appUrl: "https://getaurox.com",
        email: "support@getaurox.com",
      },
    });

    this._initialized = true;

    return new this();
  }

  async close() {
    TrezorConnect.dispose();
  }

  async signTransaction(account: HardwareSignerAccountInfo, transaction: TransactionRequest) {
    if (!this.#initialized) {
      throw new Error("Trezor can not sign this transaction. Service not running");
    }

    const address = await this.getAddress(account.path);

    if (address.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("Sender address and Trezor address do not match");
    }

    const trezorTransaction = this.#convertTransactionRequestToTrezorFormat(transaction as Required<TransactionRequest>);

    const response = await TrezorConnect.ethereumSignTransaction({
      path: account.path,
      transaction: trezorTransaction,
    });

    if (!response.success) {
      throw new Error(response.payload.error);
    }

    const fixed = {
      ...response.payload,
      v: parseInt(response.payload.v),
    };

    const unsignedTransaction = omit(transaction, "from") as ethers.utils.UnsignedTransaction;

    return ethers.utils.serializeTransaction(unsignedTransaction, fixed);
  }

  async signMessage(account: HardwareSignerAccountInfo, message: string) {
    if (!this.#initialized) {
      throw new Error("Trezor can not sign this message. Service not running");
    }

    const address = await this.getAddress(account.path);

    if (address.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("Sender address and Trezor address do not match");
    }

    const response = await TrezorConnect.ethereumSignMessage({ path: account.path, message });

    if (!response.success) {
      throw new Error(response.payload.error);
    }

    if (response.payload.address.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("Address missmatch, please make sure you are using correct password");
    }

    // Add the 0x prefix back onto the signature
    return `0x${response.payload.signature}`;
  }

  async signTypedData(account: HardwareSignerAccountInfo, typedData: SignTypedDataPayload) {
    if (!this.#initialized) {
      throw new Error("Trezor can not sign typed data. Service not running");
    }

    const address = await this.getAddress(account.path);

    if (address.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("Sender address and Trezor address do not match");
    }

    const result = await TrezorConnect.ethereumSignTypedData({
      path: account.path,
      metamask_v4_compat: true,
      data: typedData,
    });

    if (!result.success) {
      throw new Error(result.payload.error);
    }

    if (result.payload.address.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error("Address missmatch, please make sure you are using correct password");
    }

    return result.payload.signature;
  }

  async getAddress(path: string) {
    const result = await TrezorConnect.ethereumGetAddress({ path });

    if (!result.success) {
      throw new Error(result.payload.error);
    }

    return result.payload.address;
  }

  async getMultipleAddresses(startAccountNumber: number, numAddresses: number, hdPath: HdPath): Promise<HardwarePathResult[]> {
    const result = await TrezorConnect.ethereumGetAddress({
      bundle: range(numAddresses).map((_, idx) => ({
        path: getEVMSignerPath(startAccountNumber + idx, hdPath),
        showOnTrezor: false,
      })),
    });

    if (!result.success) {
      throw new Error(result.payload.error);
    }

    return result.payload.map((item, idx) => ({
      address: item.address,
      path: item.serializedPath,
      accountNumber: startAccountNumber + idx,
    }));
  }

  #convertTransactionRequestToTrezorFormat(transaction: Required<TransactionRequest>): EthereumTransaction | EthereumTransactionEIP1559 {
    const baseFields = {
      value: transaction.value.toString(),
      gasLimit: transaction.gasLimit.toString(),
      nonce: transaction.nonce.toString(16),
      data: transaction.data.toString(),
      to: transaction.to,
      chainId: transaction.chainId,
    };

    if (transaction.maxFeePerGas && transaction.maxPriorityFeePerGas) {
      return {
        ...baseFields,
        maxFeePerGas: transaction.maxFeePerGas.toString(),
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas.toString(),
      };
    }

    return {
      ...baseFields,
      gasPrice: transaction.gasPrice?.toString(),
    };
  }
}
