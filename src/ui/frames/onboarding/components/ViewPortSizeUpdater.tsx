import { useEffect } from "react";

import { useWindowSize } from "react-use";

import { useVisualViewportSize } from "ui/frames/onboarding/hooks/useVisualViewportSize";

export function ViewPortSizeUpdater() {
  const { height, width } = useWindowSize();
  const { height: viewPortHeight, width: viewPortWidth } = useVisualViewportSize();

  useEffect(() => {
    if (typeof window === "object") {
      document.documentElement.style.setProperty("--vh", height * 0.01 + "px");
      document.documentElement.style.setProperty("--vvh", viewPortHeight * 0.01 + "px");
      document.documentElement.style.setProperty("--vw", width * 0.01 + "px");
      document.documentElement.style.setProperty("--vvw", viewPortWidth * 0.01 + "px");
    }
  }, [height, viewPortHeight, viewPortWidth, width]);

  return null;
}
