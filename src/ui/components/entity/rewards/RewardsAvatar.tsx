import { Avatar, CircularProgress, Stack, StackProps } from "@mui/material";

import { defaultTheme } from "ui/common/theme";

export type Size = "small" | "large";

interface SizeValue {
  svg: {
    size: number;
    stroke: number;
  };
  avatar: {
    size: number;
  };
}

const sizes: Record<Size, SizeValue> = {
  "small": {
    svg: {
      size: 26,
      stroke: 1,
    },
    avatar: {
      size: 20,
    },
  },
  "large": {
    svg: {
      size: 126,
      stroke: 8,
    },
    avatar: {
      size: 100,
    },
  },
};

export interface RewardsAvatarProps extends Omit<StackProps, "position"> {
  size: Size;
  src: string;
  progress: number;
}

export default function RewardsAvatar({ size, progress, src, ...stackProps }: RewardsAvatarProps) {
  const sizeValue = sizes[size];
  const circleSize = sizeValue.svg.size;
  const avatarSize = sizeValue.avatar.size;

  const top = (avatarSize - circleSize) / 2;
  const left = (avatarSize - circleSize) / 2;

  return (
    <Stack m={1} position="relative" {...stackProps}>
      <Avatar sx={{ height: avatarSize, width: avatarSize }} src={src} />
      <CircularProgress
        value={100}
        thickness={3.2}
        size={circleSize}
        variant="determinate"
        sx={{
          top,
          left,
          zIndex: 1,
          position: "absolute",
          color: defaultTheme.palette.custom.grey["15"],
        }}
      />
      <CircularProgress
        value={progress}
        thickness={3.2}
        size={circleSize}
        variant="determinate"
        sx={{
          top,
          left,
          zIndex: 1,
          position: "absolute",
          color: "#5DCD58",
        }}
      />
    </Stack>
  );
}
