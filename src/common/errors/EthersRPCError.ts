import { ErrorCode } from "@ethersproject/logger";
import capitalize from "lodash/capitalize";

import { EthersRPCError } from "./types";

export function parseEthersRPCError(error: EthersRPCError) {
  const nestedError = error.error;

  switch (error?.code) {
    // Generic errors
    case ErrorCode.UNKNOWN_ERROR:
    case ErrorCode.BUFFER_OVERRUN:
      return nestedError?.message ?? "Unkown node error";

    // Argument errors
    case ErrorCode.MISSING_NEW:
      return `Missing new operator ${nestedError?.message}`;
    case ErrorCode.UNEXPECTED_ARGUMENT:
      return `Invalid number of arguments provided. ${nestedError?.message}`;
    case ErrorCode.INVALID_ARGUMENT:
      return `Invalid argument provided ${error?.reason}`;
    case ErrorCode.MISSING_ARGUMENT:
      return `Missing argument: ${nestedError?.message}`;

    // Blockchain Errors
    case ErrorCode.UNPREDICTABLE_GAS_LIMIT:
      return error.reason ?? "The gas limit could not be estimated";
    case ErrorCode.NONCE_EXPIRED:
      return "Nonce has already been used";
    case ErrorCode.CALL_EXCEPTION:
      return error.reason ?? "Contract failed with unknown error";
    case ErrorCode.TRANSACTION_REPLACED:
      return "Transaction was replaced by one with higher gas price";
    case ErrorCode.REPLACEMENT_UNDERPRICED:
      return "Replacement fee is too low! Try increasing the gas";
    case ErrorCode.INSUFFICIENT_FUNDS:
      return "Not enough funds for this transaction";

    case ErrorCode.NUMERIC_FAULT:
      return `Numeric fault in ${error.operation}. ${error.reason}`;

    default:
      return capitalize(nestedError?.message ?? "unknown error occurred");
  }
}
