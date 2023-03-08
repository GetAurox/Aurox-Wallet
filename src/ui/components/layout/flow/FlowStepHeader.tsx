import { useContext } from "react";

import { SystemProps } from "@mui/system";
import { Box, Typography } from "@mui/material";

import FlowContext from "./FlowContext";

export interface FlowStepHeaderProps extends SystemProps {
  title: string;
}

export default function FlowStepHeader(props: FlowStepHeaderProps) {
  const { title, ...system } = props;

  const { currentStep, totalSteps } = useContext(FlowContext);

  return (
    <Box display="flex" flexDirection="column" flexShrink={0} p={2} pt={1.5} {...system}>
      {typeof totalSteps === "number" && (
        <Typography variant="caption" color="text.secondary">
          Step {currentStep} of {totalSteps}
        </Typography>
      )}
      <Typography variant="h5">{title}</Typography>
    </Box>
  );
}
