import { ReactElement } from "react";

import { ButtonProps } from "@mui/material";

import { FixedPanelProps } from "../layout/misc/FixedPanel";

import WrapperControls from "./WrapperControls";

export interface CustomControlsProps extends Omit<FixedPanelProps, "direction" | "variant"> {
  primary: ReactElement<ButtonProps>;
  secondary?: ReactElement<ButtonProps>;
}

export default function CustomControls(props: CustomControlsProps) {
  const { primary, secondary, ...stackProps } = props;

  return (
    <WrapperControls {...stackProps}>
      {secondary}
      {primary}
    </WrapperControls>
  );
}
