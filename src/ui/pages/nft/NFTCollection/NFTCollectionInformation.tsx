import { memo } from "react";

import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
  coming: {
    color: theme.palette.text.primary,
    fontSize: 16,
    lineHeight: 16 / 12,
    letterSpacing: theme.typography.pxToRem(0.25),
    textAlign: "center",
    paddingTop: 20,
  },
}));

export default memo(function NFTCollectionInformation() {
  const classes = useStyles();

  return <div className={classes.coming}>Coming soon...</div>;
});
