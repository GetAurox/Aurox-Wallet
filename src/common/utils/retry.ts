export type WithRetryResult<T> = { failed: false; result: T } | { failed: true; errors: Error[] };

export async function withRetry<T>(action: (attempt?: number) => Promise<T>, maxAttempts = 3): Promise<WithRetryResult<T>> {
  let attempt = 1;

  const errors = [];

  while (attempt <= maxAttempts) {
    try {
      const result = await action(attempt);

      return { failed: false, result };
    } catch (error) {
      errors.push(error);

      attempt++;
    }
  }

  return { failed: true, errors };
}
