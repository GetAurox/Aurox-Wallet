import throttle from "lodash/throttle";
import { useLayoutEffect, useState } from "react";

type Overflow = {
  isHorizontal: boolean;
  isVertical: boolean;
};

export function useHasScrollOverflowObserver() {
  const [overflow, setOverflow] = useState({} as Overflow);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(
      throttle(([entry]) => {
        const { scrollWidth, scrollHeight, clientWidth, clientHeight } = entry.target;

        setOverflow({ isHorizontal: scrollWidth > clientWidth, isVertical: scrollHeight > clientHeight });
      }, 100),
    );

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [element]);

  return { overflow, ref: setElement };
}
