import { ReactNode } from "react";

import { SystemProps } from "@mui/system";
import { Box } from "@mui/material";

export interface FlowStepActionsProps extends SystemProps {
  children: ReactNode;
}

export default function FlowStepActions(props: FlowStepActionsProps) {
  const { children, ...system } = props;

  return (
    <Box display="flex" flexDirection="column" flexShrink={0} p={2} {...system}>
      {children}
    </Box>
  );
}
