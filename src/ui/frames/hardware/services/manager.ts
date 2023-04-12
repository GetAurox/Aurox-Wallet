import { serializeError } from "@ledgerhq/errors";

import { HardwareOperation, HardwareSignerAccountInfo, HardwareSignerType } from "common/types";
import { HdPath } from "common/wallet";

import { LedgerService } from "./ledger";
import { TrezorService } from "./trezor";

export interface HardwareServices {
  ledger: LedgerService | null;
  trezor: TrezorService | null;
}

export class HardwareOperationManager {
  static #ledgerService: LedgerService | null;
  static #trezorService: TrezorService | null;

  static #processingOperation = false;

  static async submitOperation(account: HardwareSignerAccountInfo, operation: HardwareOperation) {
    if (this.#processingOperation) {
      return { success: false, error: `Already running operation on ${operation.device}` };
    }

    this.#processingOperation = true;

    try {
      const service = await this.#resolveService(operation.device);

      const result = await this.#resolveOperation(account, operation, service);

      return { success: true, result };
    } catch (error) {
      return this.#extractError(operation.device, error);
    } finally {
      this.#processingOperation = false;
    }
  }

  static #extractError(device: HardwareSignerType, error: any) {
    const details = serializeError(error);

    const errorDetails = { success: false, error: `Unknown ${device} error` };

    if (typeof details === "string") {
      errorDetails.error = details;
    } else if (details?.message) {
      errorDetails.error = details.message;
    }

    return errorDetails;
  }

  static async getMultipleAddresses(device: HardwareSignerType, walletIndex: number, path: HdPath) {
    try {
      const service = await this.#resolveService(device);

      return await service.getMultipleAddresses(walletIndex, 5, path);
    } catch (error) {
      const details = this.#extractError(device, error);

      throw details.error;
    }
  }

  static async cancelOperation() {
    return { success: false, error: "Operation aborted by user" };
  }

  static async #resolveService(device: HardwareSignerType) {
    switch (device) {
      case "trezor":
        this.#trezorService = this.#trezorService || (await TrezorService.initialize());

        return this.#trezorService;
      case "ledger":
        this.#ledgerService = this.#ledgerService || (await LedgerService.initialize());

        return this.#ledgerService;
      default:
        throw new Error("Can not identify hardware service type");
    }
  }

  static async #resolveOperation(account: HardwareSignerAccountInfo, operation: HardwareOperation, service: LedgerService | TrezorService) {
    switch (operation.operationType) {
      case "signTransaction":
        return await service.signTransaction(account, operation.transaction);
      case "signTypedData":
        return await service.signTypedData(account, operation.typedData);
      case "signMessage":
        return await service.signMessage(account, operation.message);
      default:
        throw new Error("Hardware wallet does not support this operation");
    }
  }
}
