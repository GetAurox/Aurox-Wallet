/** This file should contain logic for deserialization of the IPC payloads */
import { BigNumber } from "@ethersproject/bignumber";

export function restoreBigNumberFields<T>(target: any): T {
  if (typeof target !== "object") {
    return target;
  }

  const restoredFields: any = {};

  for (const key of Object.keys(target)) {
    try {
      restoredFields[key] = BigNumber.from(target[key]?.hex ?? target[key]?._hex);
    } catch {
      // Continue on error since this is not a big number field
    }
  }

  return { ...target, ...restoredFields };
}
