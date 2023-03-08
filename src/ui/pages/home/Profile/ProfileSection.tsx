import { ReactNode } from "react";

import { Stack, Typography } from "@mui/material";

import { defaultTheme } from "ui/common/theme";

export interface ProfileSection {
  title: string;
  isLocked?: boolean;
  children: ReactNode;
}

export default function ProfileSection(props: ProfileSection) {
  const { title, children, isLocked } = props;

  return (
    <Stack component="section" rowGap="3px">
      <Typography variant="headingSmall" ml={2} component="h2" color={isLocked ? defaultTheme.palette.custom.grey[30] : undefined}>
        {title}
      </Typography>
      {children}
    </Stack>
  );
}
