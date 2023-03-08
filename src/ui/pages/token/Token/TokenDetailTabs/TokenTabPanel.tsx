import { ReactNode } from "react";

import { Box, BoxProps } from "@mui/material";

export interface TokenTabPanelProps extends BoxProps {
  active: boolean;
  children: ReactNode;
}

export default function TokenTabPanel(props: TokenTabPanelProps) {
  const { children, active, ...rest } = props;

  return (
    <Box role="tabpanel" p={2} hidden={!active} {...rest}>
      {active && children}
    </Box>
  );
}
