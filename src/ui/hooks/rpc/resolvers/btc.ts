import type { RPCHookResolver } from "./common";

const resolver: RPCHookResolver = {
  resolveTokenMetadata: () => Promise.reject(new Error("Not Implemented")),
};

export default resolver;
