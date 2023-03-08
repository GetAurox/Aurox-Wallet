export * from "./history";

if (process.env.MOCK_EXTENSION_API === "true") {
  const chrome = require("./chrome").default;

  globalThis.chrome = chrome;

  require("../../../serviceWorker");

  // service worker activate mock event
  const event = new Event("activate");

  (event as any).waitUntil = () => undefined;

  globalThis.dispatchEvent(event);
}
