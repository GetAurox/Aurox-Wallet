import { ReactNode } from "react";

import { SystemProps } from "@mui/system";
import { Box } from "@mui/material";

export interface WelcomeScreenProps extends SystemProps {
  children?: ReactNode;
}

export default function WelcomeScreen(props: WelcomeScreenProps) {
  const { children, ...system } = props;

  return (
    <Box display="flex" flexGrow={1} flexDirection="column" alignItems="center" justifyContent="space-between" {...system}>
      {children}
    </Box>
  );
}
