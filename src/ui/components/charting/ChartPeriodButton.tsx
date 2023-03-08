import { memo, MouseEvent } from "react";

import { Button, buttonClasses, Theme } from "@mui/material";

import { ChartPeriod } from "ui/types";

import { mixSx } from "ui/common/utils";

const sxStyles = {
  button: {
    [`&.${buttonClasses.root}`]: {
      minWidth: "36px",
      padding: "2px 4px",
      fontWeight: 500,
      fontSize: 14,
      lineHeight: 20 / 14,
      letterSpacing: "0.1px",
      backgroundColor: "transparent",
      borderRadius: "4px",
    },
  },
  active: {
    [`&.${buttonClasses.root}`]: {
      backgroundColor: (theme: Theme) => theme.palette.primary.main,
      cursor: "default",
      pointerEvents: "none",
    },
  },
};

export interface ChartPeriodButtonProps {
  period: ChartPeriod;
  active: boolean;
  onClick: (event: MouseEvent<HTMLButtonElement>, period: ChartPeriod) => void;
}

export default memo(function ChartPeriodButton(props: ChartPeriodButtonProps) {
  const { period, active, onClick } = props;

  return (
    <Button color="inherit" sx={mixSx(sxStyles.button, active && sxStyles.active)} onClick={event => onClick(event, period)}>
      {period}
    </Button>
  );
});
