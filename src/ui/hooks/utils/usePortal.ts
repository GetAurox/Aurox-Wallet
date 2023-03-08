import { ReactNode, useCallback } from "react";
import { createPortal } from "react-dom";

export function usePortal(disable?: boolean) {
  return useCallback(
    ({ children }: { children: ReactNode }) => {
      if (disable) {
        return null;
      }

      const targetElement = document.getElementById("app");

      if (!targetElement) {
        return null;
      }

      return createPortal(children, targetElement);
    },
    [disable],
  );
}
