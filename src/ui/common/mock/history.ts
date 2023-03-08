import { TypedEmitter } from "tiny-typed-emitter";
import type { Action, Update } from "history";
import cloneDeep from "lodash/cloneDeep";
import produce from "immer";

export function buildBrowserHistoryForExtensionAPIMocking() {
  if (process.env.MOCK_EXTENSION_API === "true") {
    const history = require("history").createHashHistory();

    (window as any)._mockHashHistory = history;

    history.reset = history.replace;

    const states = new Map<string, any>();

    history.getCurrentState = () => states.get(history.location.key) ?? {};

    const emitter = new TypedEmitter<{ "change": (update: Update) => void }>();

    emitter.setMaxListeners(Infinity);

    history.listen((update: Update) => {
      if (update.action !== ("POP" as Action)) {
        states.set(update.location.key, update.location.state);
      }

      emitter.emit("change", update);
    });

    history.listen = (listener: (update: Update) => void) => {
      emitter.addListener("change", listener);

      return () => {
        emitter.removeListener("change", listener);
      };
    };

    history.updateCurrentState = (recipe: (draft: any) => void) => {
      const state = cloneDeep(states.get(history.location.key) ?? {});

      const newState = produce(recipe)(state);

      if (newState === state) return;

      states.set(history.location.key, newState);

      emitter.emit("change", { action: "REPLACE" as Action, location: history.location });
    };

    history.updateCurrentStateSilently = (recipe: (draft: any) => void) => {
      const state = cloneDeep(states.get(history.location.key) ?? {});

      const newState = produce(recipe)(state);

      if (newState === state) return;

      states.set(history.location.key, newState);
    };

    return history;
  }

  return null;
}
