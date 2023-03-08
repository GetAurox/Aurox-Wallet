import { ReactNode } from "react";

import { SxProps, Theme, Tooltip, IconButton, useTheme } from "@mui/material";

import { mixSx } from "ui/common/utils";

import { IconInfo } from "ui/components/icons";

export type InfoTooltipVariant = "info" | "success" | "error" | "warning" | "severeWarning";

export interface InfoTooltipProps {
  tooltipSx?: SxProps<Theme>;
  triggerSx?: SxProps<Theme>;
  children?: ReactNode;
  variant?: InfoTooltipVariant;
}

export default function InfoTooltip(props: InfoTooltipProps) {
  const { tooltipSx, triggerSx, children, variant } = props;

  const theme = useTheme();

  return (
    <Tooltip title={<>{children}</>} enterDelay={500} leaveDelay={200} sx={tooltipSx}>
      <IconButton disableRipple sx={mixSx({ p: 0 }, triggerSx)}>
        {!variant && <IconInfo color={theme.palette.text.secondary} />}
        {variant === "info" && <IconInfo color={theme.palette.primary.main} />}
        {variant === "success" && <IconInfo color={theme.palette.success.main} />}
        {variant === "error" && <IconInfo color={theme.palette.error.main} />}
        {variant === "warning" && <IconInfo color={theme.palette.warning.main} />}
        {variant === "severeWarning" && <IconInfo color={theme.palette.custom.orange["50"]} />}
      </IconButton>
    </Tooltip>
  );
}
