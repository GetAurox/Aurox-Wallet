import { ReactNode } from "react";

import { Stack, StackProps, Typography } from "@mui/material";

export interface TokenSectionWrapperProps extends StackProps {
  title: string;
  children: ReactNode;
}

export function TokenSectionWrapper(props: TokenSectionWrapperProps) {
  const { title, children, rowGap = 1.5, ...otherStackProps } = props;

  return (
    <Stack component="section" rowGap={rowGap} {...otherStackProps}>
      <Typography variant="headingSmall" component="h4">
        {title}
      </Typography>
      {children}
    </Stack>
  );
}
