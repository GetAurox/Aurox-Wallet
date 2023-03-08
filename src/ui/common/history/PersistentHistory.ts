import { createPath, Action, Blocker, Listener, Location, MemoryHistory, To } from "history";
import { TypedEmitter } from "tiny-typed-emitter";
import { Draft, produce } from "immer";
import throttle from "lodash/throttle";
import clamp from "lodash/clamp";

import { saveHistoryToEphemeralArea, loadHistoryFromEphemeralArea } from "common/storage";

import { createLocationEntry, setLocationEntryState } from "./location";

interface PersistentHistoryEvents {
  "listen": Listener;
  "block": Blocker;
}

// based on https://github.com/remix-run/history/blob/dev/packages/history/index.ts
export class PersistentHistory implements MemoryHistory {
  #entries: Location[] = [createLocationEntry("/")];

  #index = 0;
  #location: Location = this.#entries[0];
  #action: Action = Action.Pop;

  #events = new TypedEmitter<PersistentHistoryEvents>();

  #initialized = false;

  public get index() {
    return this.#index;
  }

  public get location() {
    return this.#location;
  }

  public get action() {
    return this.#action;
  }

  constructor() {
    this.#events.setMaxListeners(Infinity);
  }

  public async initialize() {
    const history = await loadHistoryFromEphemeralArea();

    if (history) {
      this.#entries = history.entries;
      this.#index = history.index;

      this.#location = this.#entries[this.#index];
    }

    this.#initialized = true;

    return this;
  }

  public getCurrentState = <S extends Record<string, any>>(): S => {
    return (this.#entries[this.index].state ?? {}) as S;
  };

  public updateCurrentState = <S extends Record<string, any>>(recipe: (draft: Draft<S>) => void) => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    if (!this.#entries[this.index]) {
      throw new Error("Invalid state, the current location does not exist!");
    }

    this.#applyStateUpdate(recipe);
  };

  public updateCurrentStateSilently = <S extends Record<string, any>>(recipe: (draft: Draft<S>) => void) => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    if (!this.#entries[this.index]) {
      throw new Error("Invalid state, the current location does not exist!");
    }

    this.#applyStateUpdate(recipe, { silent: true });
  };

  public createHref = (to: To): string => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    return typeof to === "string" ? to : createPath(to);
  };

  public push = (to: To, state?: any): void => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    const nextAction = Action.Push;
    const nextLocation = createLocationEntry(to, state);

    if (this.#isActionAllowed(nextAction, nextLocation, () => this.push(to, state))) {
      this.#index += 1;
      this.#entries.splice(this.#index, this.#entries.length, nextLocation);

      this.#applyAction(nextAction, nextLocation);

      this.#throttledPersist();
    }
  };

  public replace = (to: To, state?: any): void => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    const nextAction = Action.Replace;
    const nextLocation = createLocationEntry(to, state);

    if (this.#isActionAllowed(nextAction, nextLocation, () => this.replace(to, state))) {
      this.#entries[this.#index] = nextLocation;

      this.#applyAction(nextAction, nextLocation);

      this.#throttledPersist();
    }
  };

  public reset = (to: To, state?: any): void => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    const action = Action.Replace;
    const location = createLocationEntry(to, state);

    if (this.#isActionAllowed(action, location, () => this.replace(to, state))) {
      this.#entries = [location];
      this.#index = 0;

      this.#applyAction(action, location);

      this.#throttledPersist();
    }
  };

  public go = (delta: number): void => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    const nextIndex = clamp(this.#index + delta, 0, this.#entries.length - 1);
    const nextAction = Action.Pop;
    const nextLocation = this.#entries[nextIndex];

    if (this.#isActionAllowed(nextAction, nextLocation, () => this.go(delta))) {
      this.#index = nextIndex;

      this.#applyAction(nextAction, nextLocation);

      this.#throttledPersist();
    }
  };

  public back = (): void => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    this.go(-1);
  };

  public forward = (): void => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    this.go(1);
  };

  public listen = (listener: Listener): (() => void) => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    this.#events.addListener("listen", listener);

    return () => {
      this.#events.removeListener("listen", listener);
    };
  };

  public block = (blocker: Blocker): (() => void) => {
    if (!this.#initialized) {
      throw new Error("PersistentHistory is not initialized!");
    }

    this.#events.addListener("block", blocker);

    return () => {
      this.#events.removeListener("block", blocker);
    };
  };

  #isActionAllowed(action: Action, location: Location, retry: () => void) {
    if (this.#events.listenerCount("block") > 0) {
      this.#events.emit("block", { action, location, retry });

      return false;
    }

    return true;
  }

  #applyStateUpdate<S extends Record<string, any>>(recipe: (draft: Draft<S>) => void, options?: { silent?: boolean }) {
    const currentState = (this.#entries[this.index].state ?? {}) as S;

    const newState = produce(currentState, recipe);

    if (newState !== currentState) {
      const newLocation = setLocationEntryState(this.#entries[this.index], newState);

      this.#entries[this.#index] = newLocation;

      this.#applyAction(Action.Replace, newLocation, options);

      this.#throttledPersist();
    }
  }

  #applyAction(action: Action, location: Location, options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    this.#action = action;
    this.#location = location;

    if (!silent) {
      this.#events.emit("listen", { action, location });
    }
  }

  async #persist() {
    await saveHistoryToEphemeralArea([...this.#entries], this.#index);
  }

  #throttledPersist = throttle(() => this.#persist(), 300);
}
