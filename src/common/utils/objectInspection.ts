import isObject from "lodash/isObject";
import isString from "lodash/isString";
import values from "lodash/values";

export function* getStringValuesFromObject(target: any): Generator<string> {
  for (const value of values(target)) {
    if (isString(value)) {
      yield value;
    } else if (isObject(value)) {
      yield* getStringValuesFromObject(value);
    }
  }
}
