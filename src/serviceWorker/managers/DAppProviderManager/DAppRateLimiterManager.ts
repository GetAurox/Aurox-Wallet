import { LRUCache } from "common/caching";

export class DAppRateLimiterManager {
  #cache: LRUCache<number>;

  #allowedRequestsPerSecond: number;

  #createKey(domain: string, time: number) {
    return `${domain}::${time}`;
  }

  #unwrapKey(key: string) {
    const [domain, time] = key.split("::");

    return { domain, time: Number(time) };
  }

  get #currentTimeInSeconds() {
    return Math.floor(Date.now() / 1000);
  }

  constructor(maxCacheEntries = 5, allowedRequestsPerSecond = 100) {
    this.#cache = new LRUCache(maxCacheEntries);
    this.#allowedRequestsPerSecond = allowedRequestsPerSecond;
  }

  /** Registers the request and updates limited status if neccessary */
  track(domain: string) {
    const key = this.#createKey(domain, this.#currentTimeInSeconds);

    const currentCalls = this.#cache.get(key) || 0;

    this.#cache.set(key, currentCalls + 1);
  }

  /**
   * Blocks the DApp if it spammed our RPC for most of the time
   * We allow three seconds to determine this behavior first
   * */
  isLimited(domain: string) {
    const requestCountPerSecond = this.#cache
      .getAll()
      .filter(([key]) => this.#unwrapKey(key).domain === domain)
      .map(([, value]) => value);

    if (requestCountPerSecond.length < 3) {
      return false;
    }

    const rateLimitExceededCount = requestCountPerSecond.filter(value => value >= this.#allowedRequestsPerSecond);

    return rateLimitExceededCount.length > requestCountPerSecond.length / 2;
  }

  clearLimiter() {
    this.#cache.clear();
  }
}
