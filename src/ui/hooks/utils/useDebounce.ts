import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, timeout: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, timeout);

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [timeout, value]);

  return debouncedValue;
}
