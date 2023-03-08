import { TypedEmitter } from "tiny-typed-emitter";
import { applyPatches, Patch } from "immer";

import { sendSyncResponderQuery, addBroadcastListener, BroadcastEvent, SenderACL } from "common/messaging";

import { COMMON_STATE_FETCH_PREFIX, COMMON_STATE_BROADCAST_PATCHES_PREFIX } from "./constants";

import { CommonStateConsumerFragment } from "./CommonStateConsumerFragment";

// redacted for content-script is synonymous with service-worker in the context of state provision
const acl: SenderACL = [["service-worker"], ["redacted"]];

export interface CommonStateConsumerEvents<Data extends NonNullable<object>> {
  "changing": (oldData: Data, newData: Data) => void;
  "changed": (newData: Data) => void;
}

export class CommonStateConsumer<Topic extends string, Data extends NonNullable<object>> extends TypedEmitter<
  CommonStateConsumerEvents<Data>
> {
  private _fetchTopic: string;
  private _broadcastPatchesTopic: string;

  private _initializing = false;
  private _destroyed = false;

  private _resolveInitialize: ((self: this) => void) | null = null;
  private _initializePromise = new Promise<this>(resolve => (this._resolveInitialize = resolve));

  private _currentState: Data | null = null;

  private _unsubscribeBroadcast: null | (() => void) = null;

  public get initialized() {
    return this._currentState !== null;
  }

  public get ready() {
    return this._initializePromise;
  }

  constructor(topic: Topic) {
    super();

    this.setMaxListeners(Infinity);

    this._fetchTopic = `${COMMON_STATE_FETCH_PREFIX}::${topic}`;
    this._broadcastPatchesTopic = `${COMMON_STATE_BROADCAST_PATCHES_PREFIX}::${topic}`;
  }

  public async initialize(): Promise<this> {
    if (this._initializing || this._currentState !== null) {
      return this;
    }

    this._initializing = true;

    // Make sure we do not accept the initial state if there was a patch while requesting it to prevent state corruption
    let gotPatches = false;

    const handlePatchBroadcast = (event: BroadcastEvent<{ patches: Patch[] }>) => {
      if (this._currentState === null) {
        gotPatches = true;
      } else {
        const newState = applyPatches(this._currentState, event.data.patches);

        if (newState !== this._currentState) {
          this.emit("changing", this._currentState, newState);

          this._currentState = newState;

          this.emit("changed", this._currentState);
        }
      }
    };

    this._unsubscribeBroadcast = addBroadcastListener<{ patches: Patch[] }>(this._broadcastPatchesTopic, acl, handlePatchBroadcast);

    this._currentState = await sendSyncResponderQuery<undefined, Data>(this._fetchTopic, "internal", undefined);

    if (this._currentState === null) {
      throw new Error("Unexpected data provided from the corresponding CommonStateProvider, null is not accepted as a valid common state");
    }

    this._initializing = false;

    if (this._destroyed) {
      return this;
    }

    if (gotPatches) {
      this._currentState = null;

      this._unsubscribeBroadcast();

      await this.initialize();
    } else {
      this._resolveInitialize?.(this);
      this._resolveInitialize = null;
    }

    return this;
  }

  public getCurrent = () => {
    if (this._currentState === null) {
      throw new Error("CommonStateConsumer is not initialized!");
    }

    return this._currentState;
  };

  public createAndAttachFragment<T>(selector: (data: Data) => T, areEqual?: (a: T, b: T) => boolean): CommonStateConsumerFragment<Data, T> {
    return new CommonStateConsumerFragment(this, selector, areEqual);
  }

  public destroy() {
    this._destroyed = true;

    this._unsubscribeBroadcast?.();
  }
}
