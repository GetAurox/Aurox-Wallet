import { ReactNode } from "react";

import { SystemProps } from "@mui/system";
import { Box } from "@mui/material";

export interface FlowStepProps extends SystemProps {
  children: ReactNode;
}

export default function FlowStep(props: FlowStepProps) {
  const { children, ...system } = props;

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} {...system}>
      {children}
    </Box>
  );
}
