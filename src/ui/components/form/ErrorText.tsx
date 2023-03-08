import { memo } from "react";
import clsx from "clsx";

import { SystemProps } from "@mui/system";
import { makeStyles } from "@mui/styles";
import { Box, Typography, Theme } from "@mui/material";

import PriorityHighIcon from "@mui/icons-material/PriorityHigh";

const useStyles = makeStyles((theme: Theme) => ({
  checkCircle: {
    display: "flex",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.palette.error.main,

    "& > svg": {
      width: 14,
      height: 14,
      margin: "auto",
      color: theme.palette.common.white,
    },
  },
}));

export interface ErrorTextProps extends SystemProps {
  disableSpaceReservation?: boolean;
  error: string | null;
}

export default memo(function ErrorText(props: ErrorTextProps) {
  const { disableSpaceReservation, error, ...system } = props;

  const classes = useStyles();

  if (disableSpaceReservation && !error) {
    return null;
  }

  return (
    <Box mb={1} display="flex" alignItems="center" visibility={error ? undefined : "hidden"} {...system}>
      <div className={clsx(classes.checkCircle)}>
        <PriorityHighIcon />
      </div>
      <Typography variant="body2" color="#f24840" ml={1}>
        {error || "-"}
      </Typography>
    </Box>
  );
});
