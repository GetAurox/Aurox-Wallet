import { TypedEmitter } from "tiny-typed-emitter";

import { registerDOMQueryResponder, domBroadcast } from "../../messaging";

import { DOM_STATE_FETCH_PREFIX, DOM_STATE_BROADCAST_SYNC_PREFIX } from "./constants";

export interface DOMStateProviderEvents {
  "destroyed": () => void;
}

export class DOMStateProvider<T> extends TypedEmitter<DOMStateProviderEvents> {
  private _fetchTopic: string;
  private _broadcastSyncTopic: string;

  private _currentState: T;

  private _unregisterResponder: () => void;

  constructor(topic: string, initialValue: T) {
    super();

    this._currentState = initialValue;

    this._fetchTopic = `${DOM_STATE_FETCH_PREFIX}::${topic}`;
    this._broadcastSyncTopic = `${DOM_STATE_BROADCAST_SYNC_PREFIX}::${topic}`;

    this._unregisterResponder = registerDOMQueryResponder<void, T>(this._fetchTopic, async () => {
      return this._currentState;
    });
  }

  public setState = (state: T) => {
    if (state !== this._currentState) {
      this._currentState = state;

      domBroadcast<T>(this._broadcastSyncTopic, state);
    }
  };

  public destroy() {
    this._unregisterResponder();

    this.emit("destroyed");
  }
}
