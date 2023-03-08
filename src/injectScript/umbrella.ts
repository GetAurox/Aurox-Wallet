import type {
  EIP1193EmitterEvents,
  EIP1193EthereumProvider,
  EIP1193EventType,
  EIP1193Request,
  UmbrellaEIP1193EthereumProvider,
  UmbrellaEIP1193RequestQueueItem,
} from "common/types";

const DEBUG_UMBRELLA = process.env.NODE_ENV === "development";

function aurox_inject_umbrella() {
  if (window.__aurox_wallet_injected) return;

  const EXPECTED_CONSTRUCTION = Symbol();

  const debugLog = (message: string, ...args: any[]) => {
    if (!DEBUG_UMBRELLA) return;

    console.warn(`[Aurox EIP1193 Umbrella] ${message}`, ...args);
  };

  let requestCounter = 0;

  const debugRequest = async <T>(request: any, deferred: boolean, target: Promise<T>): Promise<T> => {
    if (!DEBUG_UMBRELLA) return target;

    const id = ++requestCounter;
    debugLog(`Request(${id})${deferred ? " [deferred]" : ""}: `, request);

    try {
      const response = await target;

      debugLog(`Request(${id}) Response: `, response);

      return response;
    } catch (error) {
      debugLog(`Request(${id}) Failed: `, error);

      throw error;
    }
  };

  const constructMetamaskExperimentalAPIProxy = () => {
    const _metamask = {
      isUnlocked: async () => {
        debugLog("Calling _metamask.isUnlocked");

        return true;
      },
    };

    return new Proxy(_metamask, {
      get(target, property) {
        if (property in target) {
          return (target as any)[property];
        }

        debugLog(`Getting unknown property "${String(property)}" from the "_metamask" api`);

        return;
      },
      set(target, property, newValue) {
        debugLog(`Setting unexpected property "${String(property)}" on the "_metamask" api: `, newValue);

        return true;
      },
      defineProperty(target, property, attributes) {
        debugLog(`Defining unexpected property "${String(property)}" on the "_metamask" api: `, attributes);

        return true;
      },
    });
  };

  const events: EIP1193EventType[] = ["chainChanged", "accountsChanged", "connect", "providerChanged", "disconnect"];

  class UmbrellaProvider implements UmbrellaEIP1193EthereumProvider {
    private _targetProvider: EIP1193EthereumProvider | null = null;

    private _requestQueue: UmbrellaEIP1193RequestQueueItem[] = [];

    private _listeners = new Map<string, ((...args: any) => void)[]>();

    get providerName() {
      return "Aurox Wallet";
    }

    get isAurox() {
      return true;
    }

    get chainId(): string | null {
      const result = this._targetProvider?.chainId ?? null;

      debugLog(`Getting chainId with value: ${result}`);

      return result;
    }

    set chainId(value: string | null) {
      // Ignore setter on chainId, used sporadically by extraneous extensions

      debugLog(`Setting chainId to: ${value}`);
    }

    get networkVersion(): string | null {
      const result = this._targetProvider?.networkVersion ?? null;

      debugLog(`Getting networkVersion with value: ${result}`);

      return result;
    }

    set networkVersion(value: string | null) {
      // Ignore setter on networkVersion, used sporadically by extraneous extensions

      debugLog(`Setting networkVersion to: ${value}`);
    }

    get selectedAddress(): string | null {
      const result = this._targetProvider?.selectedAddress ?? null;

      debugLog(`Getting selectedAddress with value: ${result}`);

      return result;
    }

    set selectedAddress(value: string | null) {
      // Ignore setter on selectedAddress, used sporadically by extraneous extensions

      debugLog(`Setting selectedAddress to: ${value}`);
    }

    // Metamask Compatibility ------------

    get isMetaMask() {
      return true;
    }

    isConnected = () => {
      return true;
    };

    _metamask = constructMetamaskExperimentalAPIProxy();

    // -----------------------------------

    constructor(...args: any[]) {
      if (args[0] !== EXPECTED_CONSTRUCTION) {
        debugLog("Constructed an instance unexpectedly with args: ", args);
      }
    }

    setTargetStandardProvider = (provider: EIP1193EthereumProvider) => {
      if (this._targetProvider === provider) {
        debugLog("Attempted to replace TARGET provider with itself: ", provider);

        return;
      }

      debugLog("Setting TARGET provider to: ", provider);

      if (this._targetProvider) {
        for (const event of events) {
          this._targetProvider.removeListener(event, this._generalHandlers[event]);
        }
      }

      this._targetProvider = provider;

      for (const event of events) {
        this._targetProvider.on(event, this._generalHandlers[event]);
      }

      for (const requestQueueItem of this._requestQueue) {
        provider.request(requestQueueItem.payload).then(requestQueueItem.resolve).catch(requestQueueItem.reject);
      }

      this._requestQueue = [];

      window.dispatchEvent(new Event("ethereum#initialized"));
    };

    request = (payload: EIP1193Request): Promise<any> => {
      if (this._targetProvider) {
        return debugRequest(payload, false, this._targetProvider.request(payload));
      }

      return debugRequest(
        payload,
        true,
        new Promise((resolve, reject) => {
          this._requestQueue.push({ payload, resolve, reject });
        }),
      );
    };

    enable = async () => {
      debugLog("Calling deprecated [enable] method");

      return await this.request({ method: "eth_requestAccounts" });
    };

    sendAsync = (request: any, callback: (error: Error | null, result?: { result: any } | undefined) => void) => {
      debugLog("Calling deprecated [sendAsync] method with: ", request);

      if (Array.isArray(request)) {
        const promises: Promise<any>[] = request.map(item => {
          return new Promise(resolve => this.sendAsync(item, (_, result) => resolve(result)));
        });

        return Promise.allSettled(promises);
      }

      const { method, params, ...rest } = request as any;

      return this.request({ method, params })
        .then(result => callback(null, { ...rest, method, result }))
        .catch(error => callback(error, { ...rest, method, error }));
    };

    send = async (payload: any, callback?: any) => {
      debugLog("Calling deprecated [send] method with: ", payload);

      if (typeof payload === "string" && (!callback || Array.isArray(callback))) {
        const result = await this.request({ method: payload, params: callback });

        return { id: undefined, jsonrpc: "2.0", result };
      }

      if (typeof payload === "object" && typeof callback === "function") {
        return await this.sendAsync(payload, callback);
      }

      if (payload === "eth_accounts") {
        return await this.enable();
      }
    };

    addListener = <T extends EIP1193EventType>(event: T, handler: EIP1193EmitterEvents[T]) => {
      debugLog(`Registering handler on event: "${event}"`);

      let listerners = this._listeners.get(event);

      if (!listerners) {
        listerners = [];

        this._listeners.set(event, listerners);
      }

      listerners.push(handler);
    };

    on = this.addListener;

    prependListener = <T extends EIP1193EventType>(event: T, handler: EIP1193EmitterEvents[T]) => {
      debugLog(`Registering handler and prepending on event: "${event}"`);

      let listerners = this._listeners.get(event);

      if (!listerners) {
        listerners = [];

        this._listeners.set(event, listerners);
      }

      listerners.unshift(handler);
    };

    removeListener = <T extends EIP1193EventType>(event: T, handler: EIP1193EmitterEvents[T]) => {
      debugLog(`Removing handler from event: "${event}"`);

      const listerners = this._listeners.get(event);

      if (listerners) {
        const newListerners = listerners.filter(listener => handler !== ((listener as any).__original || listener));

        if (newListerners.length === 0) {
          this._listeners.delete(event);
        } else if (newListerners.length !== listerners.length) {
          this._listeners.set(event, newListerners);
        }
      }
    };

    off = this.removeListener;

    once = <T extends EIP1193EventType>(event: T, handler: EIP1193EmitterEvents[T]) => {
      debugLog(`Registering once handler on event: "${event}"`);

      let listerners = this._listeners.get(event);

      if (!listerners) {
        listerners = [];

        this._listeners.set(event, listerners);
      }

      const augmentedHandler = (...args: any[]) => {
        (handler as any)(...args);

        this.removeOnceListener(event, augmentedHandler);
      };

      (augmentedHandler as any).__original = handler;

      listerners.push(augmentedHandler);
    };

    prependOnceListener = <T extends EIP1193EventType>(event: T, handler: EIP1193EmitterEvents[T]) => {
      debugLog(`Registering once handler and prepending on event: "${event}"`);

      let listerners = this._listeners.get(event);

      if (!listerners) {
        listerners = [];

        this._listeners.set(event, listerners);
      }

      const augmentedHandler = (...args: any[]) => {
        (handler as any)(...args);

        this.removeOnceListener(event, augmentedHandler);
      };

      (augmentedHandler as any).__original = handler;

      listerners.unshift(augmentedHandler);
    };

    removeOnceListener = <T extends EIP1193EventType>(event: T, handler: EIP1193EmitterEvents[T]) => {
      debugLog(`Removing once handler from event: "${event}"`);

      const listerners = this._listeners.get(event);

      if (listerners) {
        const newListerners = listerners.filter(listener => listener !== handler);

        if (newListerners.length === 0) {
          this._listeners.delete(event);
        } else if (newListerners.length !== listerners.length) {
          this._listeners.set(event, newListerners);
        }
      }
    };

    removeAllListeners = (event?: EIP1193EventType) => {
      if (!event) {
        debugLog("Removing all handlers from all events");

        this._listeners.clear();

        return;
      }

      debugLog(`Removing all handlers from event: "${event}"`);

      this._listeners.delete(event);
    };

    emit = (event: EIP1193EventType, ...args: any[]) => this._generalHandlers[event]?.(...args) ?? false;
    eventNames = () => [...this._listeners.keys()];

    listeners = (event: EIP1193EventType) => [...(this._listeners.get(event) ?? [])];
    rawListeners = (event: EIP1193EventType) => [...(this._listeners.get(event) ?? [])];

    // A number that wouldn't make anyone unhappy
    getMaxListeners = () => 1000;
    // We don't limit the listeners so we can simply ignore this method
    setMaxListeners = () => void 0;

    _generalHandlers = Object.fromEntries(
      events.map(event => {
        const handler = (...args: any[]) => {
          let emitted = false;

          const listeners = this._listeners.get(event);

          debugLog(`Dispatching event "${event}" to ${listeners?.length ?? 0} listener(s) with: `, args);

          if (listeners) {
            for (const listener of listeners) {
              listener(...args);

              emitted = true;
            }
          }

          if (event === "disconnect") {
            const closeListeners = this._listeners.get("close");

            if (closeListeners) {
              debugLog(`Dispatching event [deprecated] "close" to ${closeListeners.length} listener(s) with: `, args);

              for (const listener of closeListeners) {
                listener(...args);

                emitted = true;
              }
            }
          }

          return emitted;
        };

        return [event, handler];
      }),
    );
  }

  window.__aurox_wallet_other_providers = [];

  const registerOtherProvider = (provider: any) => {
    if (provider?.isAurox) {
      const providerText = provider instanceof UmbrellaProvider ? "UmbrellaProvider" : "AuroxProvider";

      debugLog(`Received "${providerText}" for registration, skipping...`);

      return;
    }

    if (typeof provider?.request !== "function") {
      debugLog("Received invalid provider for registration: ", provider);

      return;
    }

    if (!window.__aurox_wallet_other_providers.includes(provider)) {
      window.__aurox_wallet_other_providers.push(provider);
    } else {
      debugLog("Registration skipped since the instance is already registered");
    }
  };

  if (window.ethereum) {
    debugLog("Detected an existing provider set as window.ethereum: ", window.ethereum);

    registerOtherProvider(window.ethereum);
  }

  if (window.web3?.currentProvider) {
    debugLog("Detected an existing provider set as window.web3: ", window.web3.currentProvider);

    registerOtherProvider(window.web3.currentProvider);
  }

  const umbrellaProviderInstance = new UmbrellaProvider(EXPECTED_CONSTRUCTION);

  window.__aurox_wallet_umbrella_provider_ref = umbrellaProviderInstance;

  const knownProps = new Set([
    "_metamask",
    "isMetaMask",
    "isAurox",
    "providerName",
    "send",
    "sendAsync",
    "request",
    "enable",
    "eventNames",
    "emit",
    "on",
    "addListener",
    "prependListener",
    "off",
    "removeListener",
    "once",
    "removeOnceListener",
    "prependOnceListener",
    "removeAllListeners",
    "listenerCount",
    "listeners",
    "rawListeners",
    "getMaxListeners",
    "setMaxListeners",
  ]);

  const privateProps = new Set(["_targetProvider", "_requestQueue", "_listeners", "_generalHandlers"]);

  const umbrellaProviderProxy = new Proxy(umbrellaProviderInstance, {
    get(target, property) {
      if (privateProps.has(String(property))) {
        debugLog(`Prevented access to private property: "${String(property)}"`);

        return;
      }

      const value = (target as any)[property];

      if (!knownProps.has(String(property))) {
        debugLog(`Accessing unknown property "${String(property)}" with value: `, value);
      }

      return value;
    },
    set(target, property, newValue) {
      const otherProviders = window.__aurox_wallet_other_providers ?? [];

      debugLog(`Setting extraneous property "${String(property)}" on ${otherProviders.length} other Providers: `, newValue);

      for (const provider of otherProviders) {
        (provider as any)[property] = newValue;
      }

      return true;
    },
    defineProperty(target, property, attributes) {
      const otherProviders = window.__aurox_wallet_other_providers ?? [];

      debugLog(`Defining extraneous property "${String(property)}" on ${otherProviders.length} other Providers: `, attributes);

      for (const provider of otherProviders) {
        Object.defineProperty(provider, property, attributes);
      }

      return true;
    },
    has: (target, property) => {
      const result = knownProps.has(String(property));

      if (!result) {
        debugLog(`Asserted existence (has) of an unknown property "${String(property)}"`);
      }

      return result;
    },

    ownKeys: () => {
      debugLog("Trapped unexpected [ownKeys] request");

      return ["selectedAddress", "chainId", "request", "networkVersion", "isMetaMask", "isAurox", "enable", "send", "sendAsync"];
    },

    getPrototypeOf: () => {
      debugLog("Trapped unexpected [getPrototypeOf] request");

      return UmbrellaProvider;
    },

    getOwnPropertyDescriptor: (target, property) => {
      debugLog(`Trapped unexpected [getOwnPropertyDescriptor] request for the "${String(property)}" property`);

      if (!privateProps.has(String(property))) {
        return Object.getOwnPropertyDescriptor(target, property);
      }
    },

    construct: (target, args) => {
      debugLog("Trapped unexpected [construct] request with args: ", args);

      const instance: any = umbrellaProviderProxy;

      return instance;
    },

    apply: (...args) => debugLog("Trapped unexpected [apply] attempt: ", args),
    deleteProperty: (...args) => (debugLog("Trapped unexpected [deleteProperty] attempt: ", args), true),
    isExtensible: (...args) => (debugLog("Trapped unexpected [isExtensible] attempt: ", args), true),
    preventExtensions: (...args) => (debugLog("Trapped unexpected [preventExtensions] attempt: ", args), true),
    setPrototypeOf: (...args) => (debugLog("Trapped unexpected [setPrototypeOf] attempt: ", args), true),
  });

  Object.defineProperty(window, "ethereum", {
    configurable: false,
    get() {
      return umbrellaProviderProxy;
    },
    set(value) {
      debugLog("Detected an attempt to set a new provider on window.ethereum: ", value);

      registerOtherProvider(value);
    },
  });

  const proxifyWeb3Candidate = (candidate: any) => {
    return new Proxy(candidate, {
      get(target, property) {
        if (property === "currentProvider") {
          debugLog("Accessing the provider through the [deprecated] window.web3.currentProvider");

          return umbrellaProviderProxy;
        }

        debugLog(`Unexpectedly accessing the "${String(property)}" property on window.web3`);

        return target[property];
      },
      set(target, property, newValue) {
        if (property === "currentProvider" && newValue) {
          debugLog("Detected an attempt to set a new provider on window.web3.currentProvider: ", newValue);

          registerOtherProvider(newValue);

          return true;
        }

        debugLog(`Unexpectedly setting the "${String(property)}" property on window.web3`);

        target[property] = newValue;

        return true;
      },
      defineProperty(target, property, attributes) {
        const newValue = attributes.get ? attributes.get() : attributes.value;

        if (property === "currentProvider" && newValue) {
          debugLog("Detected an attempt to redefine the window.web3.currentProvider with: ", attributes);

          registerOtherProvider(newValue);

          return true;
        }

        debugLog(`Unexpectedly defining the "${String(property)}" property on window.web3 with: `, attributes);

        Object.defineProperty(target, property, attributes);

        return true;
      },
      deleteProperty(target, property) {
        if (property === "currentProvider") {
          debugLog("Ignoring unexpected attempt to delete the currentProvider from the window.web3 object");
        } else {
          debugLog(`Unexpectedly deleting the "${String(property)}" property on window.web3`);

          delete target[property];
        }

        return true;
      },
    });
  };

  let currentWeb3Value = proxifyWeb3Candidate({});

  Object.defineProperty(window, "web3", {
    configurable: false,
    get() {
      debugLog("Accessing the [deprecated] window.web3 object");

      return currentWeb3Value;
    },
    set(value) {
      debugLog("Detected an attempt to set a new web3 object with provider on window.web3: ", value);

      if (value?.currentProvider) {
        registerOtherProvider(value.currentProvider);
      }

      if (value) {
        currentWeb3Value = proxifyWeb3Candidate(value);
      }
    },
  });

  window.__aurox_wallet_injected = true;
}

aurox_inject_umbrella();
