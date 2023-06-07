export const SW_KEEP_ALIVE_CHANNEL = "workarounds/sw_keep_alive";

// The base delay for the keep alive
export const SW_KEEP_ALIVE_DELAY_BASE = 10 * 1000;
// How varied the next delay will be (base + random() * variance) needed to
// make sure the sw doesn't get suddenly flooded by many tabs at once
export const SW_KEEP_ALIVE_DELAY_VARIANCE = 10 * 1000;

// How long to wait for probe to actually response
export const SW_KEEP_ALIVE_PROBE_TIMEOUT = 1000;

// How often should the service worker refill the event loop to try to keep itself alive
export const SW_KEEP_ALIVE_SELF_PROBE_INTERVAL = 10 * 1000;
