import { TypedEmitter } from "tiny-typed-emitter";

import { EIP1193EmitterEvents, EIP1193EthereumProvider, EIP1193Event, EIP1193Request } from "common/types";
import { ErrorCodes, ProviderRpcError } from "common/errors";
import { DOMActions, DOMEvents } from "common/dom";

export interface AuroxProviderConstructorOptions {
  handleProviderSwitchOnRequest: (request: EIP1193Request) => Promise<any>;
}

export class AuroxProvider extends TypedEmitter<EIP1193EmitterEvents> implements EIP1193EthereumProvider {
  _selectedAddress: string | null = null;
  _chainId: string | null = null;
  _networkVersion: string | null = null;

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

    const handler = (event: EIP1193Event) => {
      if (event.type === "connect") {
        this._chainId = event.data.chainId;
        this._networkVersion = String(Number(event.data.chainId));
      }

      if (event.type === "chainChanged") {
        this._chainId = event.data;
        this._networkVersion = String(Number(event.data));
      }

      if (event.type === "accountsChanged") {
        this._selectedAddress = event.data.length > 0 ? String(event.data[0]).toLowerCase() : null;
      }

      if (event.type === "disconnect") {
        this._selectedAddress = null;
      }

      this.emit(event.type, event.data as any);
    };

    DOMEvents.ProviderUpdate.addListener(handler);
  }

  request = async (request: EIP1193Request): Promise<any> => {
    try {
      const result = await DOMActions.SendRPCRequest.perform(request);

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
