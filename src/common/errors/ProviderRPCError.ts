export enum ErrorCodes {
  PROVIDER_CHANGE_REQUESTED = 4000,
  REJECTED = 4001,
  UNAUTHORIZED = 4100,
  UNSUPPORTED_METHOD = 4200,
  DISCONNECTED = 4900,
  CHAIN_DISCONNECTED = 4901,
  CHAIN_UNSUPPORTED = 4902,
  REQUEST_LIMIT_EXCEEDED = 32005,
}

export class ProviderRpcError extends Error {
  constructor(code: ErrorCodes) {
    super();

    this.message = this.formatError(code);
  }

  formatError(code: ErrorCodes) {
    return `${code.toString()}::${ErrorCodes[code]}`;
  }

  static parseError(error: Error) {
    const message = error.message;

    if (!message || !message.includes("::")) {
      return { code: ErrorCodes.REJECTED, data: "Unknown internal error", message: "RPC Provider error" };
    }

    const [code, data] = error.message.split("::");

    return { code: Number(code), data, message: "RPC Provider error" };
  }
}
