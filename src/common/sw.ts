const sw = globalThis as any as ServiceWorkerGlobalScope;

const isServiceWorkerContext = typeof sw.skipWaiting === "function";

export function getIsServiceWorkerContext() {
  return isServiceWorkerContext;
}

export default sw;
