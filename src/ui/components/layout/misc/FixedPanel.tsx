import { ReactNode, useEffect, useRef, useState } from "react";

import { Box, StackProps, SxProps, Theme } from "@mui/material";

import { DEFAULT_POPUP_WIDTH } from "common/manifest";
import { usePortal } from "ui/hooks";

export interface FixedPanelProps extends StackProps {
  variant: "top" | "bottom";
  spacerSx?: SxProps<Theme>;
  disablePortal?: boolean;
  children?: ReactNode;
}

export default function FixedPanel(props: FixedPanelProps) {
  const { variant, spacerSx, disablePortal, children, ...sx } = props;

  const Portal = usePortal(disablePortal);

  const [spacerHeight, setSpacerHeight] = useState<number>();

  const containerRef = useRef<HTMLDivElement>(null);

  const { offsetHeight = 0 } = containerRef.current ?? {};

  useEffect(() => {
    setSpacerHeight(offsetHeight);
  }, [offsetHeight]);

  const footerElement = (
    <Box
      zIndex={50}
      position="fixed"
      top={variant === "top" ? 0 : "auto"}
      bottom={variant === "bottom" ? 0 : "auto"}
      width={DEFAULT_POPUP_WIDTH}
      ref={containerRef}
      {...sx}
    >
      {children}
    </Box>
  );

  return (
    <>
      <Box flexShrink={0} height={spacerHeight} sx={spacerSx} />
      {disablePortal && footerElement}
      {!disablePortal && <Portal>{footerElement}</Portal>}
    </>
  );
}
