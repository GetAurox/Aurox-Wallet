import { serializeError } from "@ledgerhq/errors";

import { HardwareOperation, HardwareSignerAccountInfo } from "common/types";

import { LedgerService } from "./ledger";
import { TrezorService } from "./trezor";

export class HardwareOperationManager {
  static #service: LedgerService | TrezorService | null;

  static #processingOperation = false;

  static async submitOperation(account: HardwareSignerAccountInfo, operation: HardwareOperation) {
    if (this.#processingOperation) {
      return { success: false, error: `Already running operation on ${operation.device}` };
    }

    this.#processingOperation = true;

    try {
      this.#service = await this.#resolveService(operation);

      const result = await this.#resolveOperation(account, operation, this.#service);

      return { success: true, result };
    } catch (error) {
      const details = serializeError(error);

      const errorDetails = { success: false, error: `Unknown ${operation.device} error` };

      if (typeof details === "string") {
        errorDetails.error = details;
      } else if (details?.message) {
        errorDetails.error = details.message;
      }

      return errorDetails;
    } finally {
      this.#processingOperation = false;
    }
  }

  static async cancelOperation() {
    return { success: false, error: "Operation aborted by user" };
  }

  static async #resolveService(operation: HardwareOperation) {
    if (this.#service) {
      return this.#service;
    }

    switch (operation.device) {
      case "trezor":
        return await TrezorService.initialize();
      case "ledger":
        return await LedgerService.initialize();
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
