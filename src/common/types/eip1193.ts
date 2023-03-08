export interface EIP1193Request<Params extends object = unknown[] | object> {
  method: string;
  params?: Params;
}

export type EIP1193Response<Data = unknown> = Data;

// naming is based on: https://eips.ethereum.org/EIPS/eip-1193#chain-changes
export type EIP1193Event =
  | { type: "chainChanged"; data: string }
  | { type: "accountsChanged"; data: string[] }
  | { type: "connect"; data: { chainId: string } }
  | { type: "providerChanged"; data: { preferAurox: boolean } }
  | { type: "disconnect"; data?: string | null };

export type EIP1193EventType = EIP1193Event["type"];

export type EIP1193EventFromType<T extends EIP1193EventType> = Extract<EIP1193Event, { type: T }>;

export type EIP1193EmitterEvents = { [P in EIP1193Event["type"]]: (data: Extract<EIP1193Event, { type: P }>["data"]) => void };

export interface EIP1193EthereumProvider {
  readonly chainId: string | null;
  request: (payload: EIP1193Request) => Promise<any>;
  on: <T extends EIP1193EventType>(event: T, handler: EIP1193EmitterEvents[T]) => void;
  removeListener: <T extends EIP1193EventType>(event: T, handler: EIP1193EmitterEvents[T]) => void;

  /** @deprecated */
  readonly selectedAddress: string | null;

  /** @deprecated Use chainId instead */
  readonly networkVersion: string | null;

  /** @deprecated Use `request` method */
  enable: () => Promise<any>;

  /** @deprecated Use `request` method */
  sendAsync: (request: any, callback: (error: Error | null, result?: { result: any }) => void) => void;

  /** @deprecated Use `request` method */
  send: (payload: any, callback?: any) => Promise<any> | void;
}

export interface UmbrellaEIP1193RequestQueueItem<Params extends object = unknown[] | object, Data = unknown> {
  payload: EIP1193Request<Params>;
  resolve: (data: Data) => void;
  reject: (error: any) => void;
}

export interface UmbrellaEIP1193EthereumProvider extends EIP1193EthereumProvider {
  setTargetStandardProvider: (provider: EIP1193EthereumProvider) => void;
}
