import { ReactNode, useMemo } from "react";

import { SystemProps } from "@mui/system";
import { Box } from "@mui/material";

import Header from "../misc/Header";

import FlowContext from "./FlowContext";

export interface FlowProps extends SystemProps {
  title: string;
  currentStep?: number | null;
  totalSteps?: number | null;
  hideBackButton?: boolean;
  hideCloseButton?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  children: ReactNode;
}

export default function Flow(props: FlowProps) {
  const { title, currentStep, totalSteps, hideBackButton, hideCloseButton, onClose, onBack, children, ...system } = props;

  const context = useMemo(() => ({ currentStep: currentStep ?? null, totalSteps: totalSteps ?? null }), [currentStep, totalSteps]);

  return (
    <Box display="flex" flexDirection="column" flexGrow={1} {...system}>
      <Header
        title={title}
        onCloseClick={hideCloseButton ? undefined : onClose}
        onBackClick={hideBackButton || currentStep === 1 ? undefined : onBack}
      />
      <FlowContext.Provider value={context}>{children}</FlowContext.Provider>
    </Box>
  );
}
