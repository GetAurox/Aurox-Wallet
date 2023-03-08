import { ReactNode } from "react";

import FixedPanel, { FixedPanelProps } from "../layout/misc/FixedPanel";

const sxStyles = {
  fixedPanelSpacer: {
    mt: 2,
  },
};

export interface WrapperControlsProps extends Omit<FixedPanelProps, "direction" | "variant"> {
  children: ReactNode;
}

export default function WrapperControls(props: WrapperControlsProps) {
  const { children, ...stackProps } = props;

  return (
    <FixedPanel
      p={2}
      disablePortal
      display="flex"
      columnGap={1.5}
      direction="row"
      variant="bottom"
      alignItems="center"
      bgcolor="background.paper"
      borderRadius="10px 10px 0 0"
      justifyContent="space-between"
      spacerSx={sxStyles.fixedPanelSpacer}
      {...stackProps}
    >
      {children}
    </FixedPanel>
  );
}
