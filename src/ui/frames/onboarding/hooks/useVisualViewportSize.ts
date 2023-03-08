import { useEffect } from "react";

import { useRafState } from "react-use";

export const useVisualViewportSize = (initialWidth = Infinity, initialHeight = Infinity) => {
  const [state, setState] = useRafState<{ width: number; height: number }>({
    width: typeof window === "object" ? window.visualViewport?.width ?? initialWidth : initialWidth,
    height: typeof window === "object" ? window.visualViewport?.height ?? initialHeight : initialHeight,
  });

  useEffect((): (() => void) | void => {
    if (typeof window === "object") {
      const handler = () => {
        setState({
          width: window.visualViewport?.width ?? initialWidth,
          height: window.visualViewport?.height ?? initialHeight,
        });
      };

      window.visualViewport?.addEventListener("resize", handler);

      return () => {
        window.visualViewport?.removeEventListener("resize", handler);
      };
    }
  }, [setState, initialWidth, initialHeight]);

  return state;
};
