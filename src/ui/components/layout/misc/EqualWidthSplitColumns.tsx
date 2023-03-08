import { ReactNode } from "react";

import { Grid, Divider } from "@mui/material";

export interface EqualWidthSplitColumnsProps {
  left: ReactNode;
  right: ReactNode;
}

export default function EqualWidthSplitColumns(props: EqualWidthSplitColumnsProps) {
  const { left, right } = props;

  return (
    <Grid container columns={2} columnGap={2.5}>
      <Grid container item direction="column" rowGap={1} xs>
        {left}
      </Grid>
      <Divider orientation="vertical" flexItem />
      <Grid container item direction="column" rowGap={1} xs>
        {right}
      </Grid>
    </Grid>
  );
}
