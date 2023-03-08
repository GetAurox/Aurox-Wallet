import { TypedEmitter } from "tiny-typed-emitter";

import { sendDOMQuery, addDOMBroadcastListener } from "../../messaging";

import { DOM_STATE_FETCH_PREFIX, DOM_STATE_BROADCAST_SYNC_PREFIX } from "./constants";

export interface DOMStateConsumerEvents<T> {
  "changing": (oldData: T, newData: T) => void;
  "changed": (newData: T) => void;
}

export class DOMStateConsumer<T> extends TypedEmitter<DOMStateConsumerEvents<T>> {
  private _fetchTopic: string;
  private _broadcastSyncTopic: string;

  private _initialized = false;
  private _currentState: T;

  private _unsubscribeBroadcast: null | (() => void) = null;

  private _readyPromise: Promise<this>;

  get initialized() {
    return this._initialized;
  }

  get ready() {
    return this._readyPromise;
  }

  constructor(topic: string, defaultValue: T) {
    super();

    this._fetchTopic = `${DOM_STATE_FETCH_PREFIX}::${topic}`;
    this._broadcastSyncTopic = `${DOM_STATE_BROADCAST_SYNC_PREFIX}::${topic}`;

    this._currentState = defaultValue;

    this._readyPromise = this.initialize();
  }

  private initialize = async () => {
    this._unsubscribeBroadcast = addDOMBroadcastListener<T>(this._broadcastSyncTopic, data => {
      if (data !== this._currentState) {
        this.emit("changing", this._currentState!, data);

        this._currentState = data;

        this.emit("changed", this._currentState);
      }
    });

    this._currentState = await sendDOMQuery<undefined, T>(this._fetchTopic, undefined);

    this._initialized = true;

    return this;
  };

  public getCurrent = () => {
    return this._currentState as T;
  };

  public destroy() {
    this._unsubscribeBroadcast?.();
  }
}
