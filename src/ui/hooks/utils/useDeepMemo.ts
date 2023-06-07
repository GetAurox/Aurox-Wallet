import { useRef } from "react";

import isEqual from "lodash/isEqual";

export function useDeepMemo<T extends object | null>(value: T): T {
  const effectiveValue = useRef(value);

  if (value !== effectiveValue.current && !isEqual(value, effectiveValue.current)) {
    effectiveValue.current = value;
  }

  return effectiveValue.current;
}
