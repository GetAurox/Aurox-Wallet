import { TypedEmitter } from "tiny-typed-emitter";

const noop = () => undefined;

const events = new TypedEmitter();

events.setMaxListeners(Infinity);

const api = {
  tabs: {
    create: ({ url }: { url: string }) => {
      window.open(url, "_black");
    },
    query: async () => {
      return [{ id: 1, discarded: false, url: `https://${location.hostname}` }];
    },
    sendMessage: noop,
  },
  storage: {
    onChanged: {
      addListener: (callback: any) => events.addListener("storage", callback),
      removeListener: (callback: any) => events.removeListener("storage", callback),
    },
    local: {
      get: async (key: string | null) => {
        if (key === null) {
          const all: Record<string, any> = {};

          for (let i = 0; i < localStorage.length; i++) {
            const keyAtIndex = localStorage.key(i);

            if (keyAtIndex) {
              const value = localStorage.getItem(keyAtIndex);

              if (value) {
                all[keyAtIndex] = JSON.parse(value);
              }
            }
          }

          return all;
        }

        const value = localStorage.getItem(key);

        if (value) {
          return { [key]: JSON.parse(value) };
        }

        return { [key]: null };
      },
      set: async (map: any) => {
        for (const [key, value] of Object.entries(map)) {
          localStorage.setItem(key, JSON.stringify(value ?? null));
        }
      },
      remove: async (keys: string[]) => {
        for (const key of keys) {
          localStorage.removeItem(key);
        }
      },
    },
    sync: {
      get: async (key: string) => {
        const value = localStorage.getItem(`[sync] ${key}`);

        if (value) {
          return { [key]: JSON.parse(value) };
        }

        return { [key]: null };
      },
      set: async (map: any) => {
        for (const [key, value] of Object.entries(map)) {
          localStorage.setItem(`[sync] ${key}`, JSON.stringify(value ?? null));
        }
      },
    },
    session: {
      get: async (key: string) => {
        const value = sessionStorage.getItem(key);

        if (value) {
          return { [key]: JSON.parse(value) };
        }

        return { [key]: null };
      },
      set: async (map: any) => {
        for (const [key, value] of Object.entries(map)) {
          sessionStorage.setItem(key, JSON.stringify(value ?? null));
        }
      },
    },
  },
  runtime: {
    id: "aurox_wallet_extension",
    getURL: (path: string) => `chrome-extension://aurox_wallet_extension/${path}`,
    sendMessage: (data: any, callback?: (payload?: any) => void) => {
      let responded = false;

      const sendResponse = (payload: any) => {
        if (!responded) {
          responded = true;

          callback?.(payload);
        }
      };

      events.emit("global", data, {}, sendResponse);

      if (!responded) {
        responded = true;

        callback?.();
      }
    },
    onMessage: {
      addListener: (callback: any) => events.addListener("global", callback),
      removeListener: (callback: any) => events.removeListener("global", callback),
    },
    onInstalled: {
      addListener: () => {
        // nothing to do
      },
    },
  },
  declarativeNetRequest: {
    updateEnabledRulesets: (options: { disableRulesetIds?: string[] | undefined; enableRulesetIds?: string[] | undefined }) => {
      // nothing to do
    },
  },
  action: {
    getUserSettings: () => {
      return {
        isOnToolbar: true,
      };
    },
  },
} as unknown as typeof chrome;

export default api;

api.storage.local.get();
