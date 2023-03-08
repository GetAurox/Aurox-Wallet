import { memo } from "react";
import clsx from "clsx";

import { SystemProps } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { Box, Typography, Theme } from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";

const useStyles = makeStyles((theme: Theme) => ({
  checkCircle: {
    display: "flex",
    width: 16,
    height: 16,
    borderRadius: 8,

    "& > svg": {
      width: 14,
      height: 14,
      margin: "auto",
      color: theme.palette.common.white,
    },
  },
  unsatisfied: {
    backgroundColor: theme.palette.text.secondary,
  },
  satisfied: {
    backgroundColor: theme.palette.success.main,
  },
}));

export interface CriterionProps extends SystemProps {
  className?: string;
  label: string;
  satisfied: boolean;
}

export default memo(function Criterion(props: CriterionProps) {
  const { className, label, satisfied, ...system } = props;

  const classes = useStyles();

  return (
    <Box className={className} mb={1} display="flex" alignItems="center" {...system}>
      <div className={clsx(classes.checkCircle, satisfied ? classes.satisfied : classes.unsatisfied)}>
        <CheckIcon />
      </div>
      <Typography variant="body2" ml={1}>
        {label}
      </Typography>
    </Box>
  );
});
