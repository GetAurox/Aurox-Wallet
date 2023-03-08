import { ReactNode } from "react";

import { Stack, Typography } from "@mui/material";

export interface InfoPairProps {
  caption?: ReactNode;
  value?: ReactNode;
  subValue?: ReactNode;
}

export default function InfoPair(props: InfoPairProps) {
  const { caption, value, subValue } = props;

  return (
    <Stack>
      {caption && (
        <Typography variant="medium" color="text.secondary" alignSelf="start">
          {caption}
        </Typography>
      )}
      {value && (
        <Typography variant="large" fontWeight={500} mt={0.25}>
          {value}
        </Typography>
      )}
      {subValue && (
        <Typography variant="medium" color="text.secondary" mt={0.25}>
          {subValue}
        </Typography>
      )}
    </Stack>
  );
}
