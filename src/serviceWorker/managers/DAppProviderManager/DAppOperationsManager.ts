import { DApp as DAppEvents } from "common/events";
import { Operation, OperationResponse } from "common/types";
import { PublicDAppOperationsState } from "common/states";
import { ErrorCodes, ProviderRpcError } from "common/errors";
import { getContractABI, getNetworkDefinitionFromIdentifier, isApproval } from "common/utils";

import { ERC20Approval } from "ui/common/tokens";

import { TypedEmitter } from "tiny-typed-emitter";

import { WindowManager } from "./WindowManager";

export interface DAppOperationsManagerEvents {
  "operation-aborted": (operationId: string) => void;
}

export class DAppOperationsManager extends TypedEmitter<DAppOperationsManagerEvents> {
  #windowManager: WindowManager;
  #operationsProvider: PublicDAppOperationsState.Provider;

  constructor(windowManager: WindowManager, operationsProvider: PublicDAppOperationsState.Provider) {
    super();

    this.#windowManager = windowManager;
    this.#operationsProvider = operationsProvider;
  }

  #isValidOperationCandidate(operations: Operation[], candidate: Operation) {
    // Keep only one connection request per site
    if (candidate.operationType === "connect") {
      return !operations.some(x => x.operationType === "connect" && x.domain === candidate.domain);
    }

    return true;
  }

  async #addOperationToQueue(operation: Operation) {
    await this.#operationsProvider.update(draft => {
      const canAddOperation = this.#isValidOperationCandidate(draft.operations, operation);

      if (canAddOperation) {
        draft.operations.unshift(operation);
      }
    });

    // Fire & Forget
    // The outcome of this operation should not interrupt or slow down the flow
    this.#getOperationDetails(operation);
  }

  /**
   * Get ABI of the destination contract if possible using third party
   */
  async #getOperationDetails(operation: Operation) {
    if (operation.operationType !== "transact") return;

    try {
      let contractABI = "";

      if (isApproval(operation.transactionPayload.data)) {
        contractABI = ERC20Approval.ABI;
      } else {
        const { chainId } = getNetworkDefinitionFromIdentifier(operation.networkIdentifier);

        contractABI = await getContractABI(operation.transactionPayload.to, chainId);
      }

      this.#operationsProvider.update(draft => {
        const index = draft.operations.map(op => op.id).indexOf(operation.id);

        const newOperation = draft.operations[index];

        if (newOperation && newOperation.operationType === "transact") {
          draft.operations[index] = {
            ...newOperation,
            contractABI,
          };
        }
      });
    } catch (error) {
      console.error("Unable to decode transaction", error);
    }
  }

  async #removeOperationFromQueue(operationId: string, keepPopupAlive: boolean) {
    this.emit("operation-aborted", operationId);

    this.#operationsProvider.update(draft => {
      draft.operations = draft.operations.filter(x => x.id !== operationId);

      if (draft.operations.length === 0 && !keepPopupAlive) {
        this.#windowManager.removePopup();
      }
    });
  }

  async #resolveOperation<T extends OperationResponse>(operationId: string, window: chrome.windows.Window): Promise<[T, boolean]> {
    return new Promise(resolve => {
      let settled = false;

      DAppEvents.TransactionRequestResponded.addListener(payload => {
        if (!settled && payload.operationId === operationId) {
          settled = true;

          resolve([payload.result as T, payload.keepPopupAlive]);
        }
      });

      const handleWindowClose = (windowId: number) => {
        if (!settled && windowId === window.id) {
          settled = true;
          resolve([null as T, false]);

          chrome.windows.onRemoved.removeListener(handleWindowClose);
        }
      };

      chrome.windows.onRemoved.addListener(handleWindowClose);
    });
  }

  async clearOperations() {
    this.#operationsProvider.update(draft => {
      draft.operations = draft.operations.filter(() => false);

      this.#windowManager.removePopup();
    });
  }

  async removePopup() {
    this.#windowManager.removePopup();
  }

  async scheduleOperation<T extends OperationResponse>(operation: Operation) {
    await this.#addOperationToQueue(operation);

    const popupWindow = await this.#windowManager.getOrCreatePopup();

    const [result, keepPopupAlive] = await this.#resolveOperation<T>(operation.id, popupWindow);

    await this.#removeOperationFromQueue(operation.id, keepPopupAlive);

    if (!result) {
      throw new ProviderRpcError(ErrorCodes.REJECTED);
    }

    return result;
  }
}
