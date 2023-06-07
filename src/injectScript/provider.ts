import { TypedEmitter } from "tiny-typed-emitter";

import { EIP1193EmitterEvents, EIP1193EthereumProvider, EIP1193Event, EIP1193Request } from "common/types";
import { ErrorCodes, ProviderRpcError } from "common/errors";
import { DOMActions, DOMEvents } from "common/dom";

import { StreamProvider } from "./stream";

export interface AuroxProviderConstructorOptions {
  streamProvider: StreamProvider;
  handleProviderSwitchOnRequest: (request: EIP1193Request) => Promise<any>;
}

export class AuroxProvider extends TypedEmitter<EIP1193EmitterEvents> implements EIP1193EthereumProvider {
  _selectedAddress: string | null = null;
  _chainId: string | null = null;
  _networkVersion: string | null = null;
  _initialized = false;

  _streamProvider: StreamProvider;

  _handleProviderSwitchOnRequest: (request: EIP1193Request) => Promise<any>;

  get selectedAddress(): string | null {
    return this._selectedAddress;
  }

  get chainId(): string | null {
    return this._chainId;
  }

  get networkVersion(): string | null {
    return this._networkVersion;
  }

  constructor(options: AuroxProviderConstructorOptions) {
    super();

    this.setMaxListeners(Infinity);

    this._handleProviderSwitchOnRequest = options.handleProviderSwitchOnRequest;

    this._streamProvider = options.streamProvider;

    this._initialize();

    const handler = (event: EIP1193Event) => {
      if (!this._initialized) return;

      if (event.type === "connect") {
        this._chainId = event.data.chainId;
        this._networkVersion = String(Number(event.data.chainId));
      }

      if (event.type === "chainChanged") {
        if (this._chainId === event.data) {
          return;
        }

        this._chainId = event.data;
        this._networkVersion = String(Number(event.data));
      }

      if (event.type === "accountsChanged") {
        const newAddress = event.data.length > 0 ? String(event.data[0]).toLowerCase() : null;

        if (newAddress?.toLowerCase() === this._selectedAddress?.toLowerCase()) {
          return;
        }

        this._selectedAddress = newAddress;
      }

      if (event.type === "disconnect") {
        this._selectedAddress = null;
        this._chainId = null;
      }

      if (event.type === "notification") {
        // Also emit legacy `message` event
        this.emit("message", event.data);
      }

      this.emit(event.type, event.data as any);
    };

    this._streamProvider.addListener("notification", handler);

    DOMEvents.ProviderUpdate.addListener(handler);
  }

  isConnected = () => {
    return !!this._chainId;
  };

  _initialize = async () => {
    const [accounts, chainId] = await Promise.all([
      DOMActions.SendRPCRequest.perform({ method: "eth_accounts" }),
      DOMActions.SendRPCRequest.perform({ method: "eth_chainId" }),
    ]);

    if (typeof chainId === "string" && Array.isArray(accounts)) {
      this._selectedAddress = accounts.length > 0 && typeof accounts[0] === "string" ? accounts[0].toLowerCase() : null;
      this._chainId = chainId;
    }

    this._initialized = true;
  };

  request = async (request: EIP1193Request): Promise<any> => {
    try {
      const webSocketResponse = await this._streamProvider.handle(request, this.chainId);

      if (webSocketResponse) {
        return webSocketResponse;
      }

      const result = await DOMActions.SendRPCRequest.perform(request);

      if (["eth_accounts", "eth_requestAccounts"].includes(request.method) && Array.isArray(result)) {
        this._selectedAddress = result.length > 0 && typeof result[0] === "string" ? result[0].toLowerCase() : null;
      } else if (request.method === "eth_chainId" && typeof result === "string") {
        this._chainId = result;
      }

      return assertLowerCaseAddressesExposedToDApp(request, result);
    } catch (error) {
      const rpcError = ProviderRpcError.parseError(error);

      if (rpcError.code && rpcError.code === ErrorCodes.PROVIDER_CHANGE_REQUESTED) {
        return await this._handleProviderSwitchOnRequest(request);
      }

      throw rpcError;
    }
  };

  enable = () => {
    throw new Error("enable is Deprecated");
  };

  sendAsync = () => {
    throw new Error("sendAsync is Deprecated");
  };

  send = () => {
    throw new Error("send is Deprecated");
  };
}

function assertLowerCaseAddressesExposedToDApp(request: EIP1193Request, result: any) {
  switch (request.method) {
    case "eth_accounts":
    case "eth_requestAccounts":
      return Array.isArray(result)
        ? result.map(address => String(address).toLowerCase())
        : typeof result === "string"
        ? result.toLowerCase()
        : result;
  }

  return result;
}
