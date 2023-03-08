import TrezorConnect, { EthereumTransaction, EthereumTransactionEIP1559 } from "@trezor/connect-web";

import range from "lodash/range";

import { HARDWARE_URL } from "common/entities";
import { TransactionRequest } from "common/types";

import { HdPath, getEVMSignerPath } from "../signerPaths";

import { HardwarePathResult } from "./types";

export class TrezorManifest {
  private static _isInitialized = false;

  static initialize() {
    if (this._isInitialized) return;

    TrezorConnect.manifest({
      email: "support@getaurox.com",
      appUrl: HARDWARE_URL,
    });

    this._isInitialized = true;
  }
}

export const convertTransactionRequestToTrezorFormat = (
  transaction: Required<TransactionRequest>,
): EthereumTransaction | EthereumTransactionEIP1559 => {
  const baseFields = {
    value: transaction.value.toString(),
    gasLimit: transaction.gasLimit.toString(),
    nonce: transaction.nonce.toString(),
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
};

export const getMultipleAddresses = async (
  startAccountNumber: number,
  numAddresses: number,
  hdPath: HdPath,
): Promise<HardwarePathResult[]> => {
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
};
