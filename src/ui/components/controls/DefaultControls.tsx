import { MouseEvent } from "react";

import { Button } from "@mui/material";

import { FixedPanelProps } from "../layout/misc/FixedPanel";

import WrapperControls from "./WrapperControls";

export interface DefaultControlsProps extends Omit<FixedPanelProps, "direction" | "variant"> {
  /**
   * text of primary (right) button
   * @default "Save"
   */
  primary?: string;
  /**
   * text of secondary (left) button
   * @default "Cancel"
   */
  secondary?: string;
  disabledPrimary?: boolean;
  disabledSecondary?: boolean;
  onPrimary: (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void;
  onSecondary?: (event: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => void;
}

export default function DefaultControls(props: DefaultControlsProps) {
  const { onPrimary, onSecondary, primary = "Save", secondary = "Cancel", disabledPrimary, disabledSecondary, ...stackProps } = props;

  return (
    <WrapperControls {...stackProps}>
      {onSecondary && (
        <Button variant="outlined" fullWidth onClick={onSecondary} disabled={disabledSecondary}>
          {secondary}
        </Button>
      )}
      <Button variant="contained" fullWidth onClick={onPrimary} disabled={disabledPrimary}>
        {primary}
      </Button>
    </WrapperControls>
  );
}
