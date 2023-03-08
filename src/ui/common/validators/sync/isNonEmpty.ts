import isEmpty from "validator/es/lib/isEmpty";

export function isNonEmpty(value: string | undefined | null): value is string {
  return value !== undefined && value !== null && !isEmpty(value);
}
