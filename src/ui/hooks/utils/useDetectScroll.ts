import { useEffect } from "react";

export function useDetectScroll() {
  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      const { deltaY, deltaX } = event;
      let timeout: number | undefined = undefined;

      const htmlElement = document.getElementsByTagName("html")[0];

      if (htmlElement && (Math.abs(deltaX) >= 10 || Math.abs(deltaY) >= 10)) {
        window.clearTimeout(timeout);

        htmlElement.classList.add("scroll");
      } else {
        timeout = window.setTimeout(() => {
          htmlElement.classList.remove("scroll");
        }, 2e3);
      }
    }

    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);
}
