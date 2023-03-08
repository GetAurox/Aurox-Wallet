const __branding = "@@SerializableError/Brand@@";

export abstract class SerializableError extends Error {
  static #brands = new Map<string, { new (message?: string): SerializableError }>();

  static registerBrand(brand: string, type: { new (message?: string): SerializableError }) {
    SerializableError.#brands.set(brand, type);
  }

  static dehydrate(error: SerializableError): object {
    return { [__branding]: error.#brand, message: error.message, stack: error.stack, ...error.getDehydratedData() };
  }

  static rehydrate<T extends SerializableError = SerializableError>(obj: any): T {
    const { [__branding]: brand, message, stack, ...data } = obj ?? {};

    let error;

    const ErrorType = SerializableError.#brands.get(brand);

    if (ErrorType) {
      error = new ErrorType(message);

      error.applyRehydratedData(data);
    } else {
      error = new Error(message);
    }

    if (stack) {
      error.stack = stack;
    }

    return error as T;
  }

  #brand: string;

  protected constructor(brand: string, message?: string, options?: ErrorOptions) {
    super(message, options);

    this.#brand = brand;
  }

  protected abstract getDehydratedData(): object;

  protected abstract applyRehydratedData(data: any): void;
}
