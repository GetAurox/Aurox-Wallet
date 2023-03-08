import { ReactNode } from "react";

import { SystemProps } from "@mui/system";
import { Box } from "@mui/material";

export interface FlowStepBodyProps extends SystemProps {
  children: ReactNode;
}

export default function FlowStepBody(props: FlowStepBodyProps) {
  const { children, ...system } = props;

  return (
    <Box display="flex" flexDirection="column" alignItems="stretch" p={2} pt={1} flexGrow={1} {...system}>
      {children}
    </Box>
  );
}
