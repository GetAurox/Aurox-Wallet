import { memo } from "react";

import makeStyles from "@mui/styles/makeStyles";

import { Box, CircularProgress, Theme, Typography } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  loaderWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  text: {
    marginBottom: "23px",
    fontSize: "20px",
    lineHeight: theme.typography.pxToRem(24),
    letterSpacing: theme.typography.pxToRem(0.15),
    fontWeight: 500,
  },
}));

export interface LoadingScreenProps {
  text: string;
}

export default memo(function LoadingScreen(props: LoadingScreenProps) {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.loaderWrapper}>
        <Typography className={classes.text}>{props.text}</Typography>
        <CircularProgress sx={{ color: "#fff" }} />
      </Box>
    </Box>
  );
});
