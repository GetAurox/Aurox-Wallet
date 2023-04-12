import { isObject, isString, values } from "lodash";

export function* getStringValuesFromObject(target: any): Generator<string> {
  for (const value of values(target)) {
    if (isString(value)) {
      yield value;
    } else if (isObject(value)) {
      yield* getStringValuesFromObject(value);
    }
  }
}
