export class LRUCache<T> {
  #capacity: number;

  #accessOrder: string[] = [];
  #cache: Record<string, T> = {};

  constructor(capacity: number) {
    this.#capacity = capacity;
  }

  get(key: string): T | null {
    const value = this.#cache[key] ?? null;

    if (value) {
      this.#updateAccessOrder(key);
    }

    return value;
  }

  set(key: string, value: T): void {
    if (this.#cache[key]) {
      this.#cache[key] = value;

      this.#updateAccessOrder(key);

      return;
    }

    if (Object.keys(this.#cache).length >= this.#capacity) {
      this.#removeLRU();
    }

    this.#cache[key] = value;
    this.#accessOrder.push(key);
  }

  getAll(): [string, T][] {
    return Object.keys(this.#cache).map(key => [key, this.#cache[key]]);
  }

  clear() {
    for (const key of this.#accessOrder) {
      delete this.#cache[key];
    }
  }

  #updateAccessOrder(key: string): void {
    const index = this.#accessOrder.indexOf(key);

    this.#accessOrder.splice(index, 1);

    this.#accessOrder.push(key);
  }

  #removeLRU(): void {
    const key = this.#accessOrder.shift();

    if (key) {
      delete this.#cache[key];
    }
  }
}
