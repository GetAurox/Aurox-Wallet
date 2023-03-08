import { memo } from "react";
import { Box, BoxProps } from "@mui/material";

import { IconsType } from "./types";

type BasicProps = { size?: "small" | "medium" | "large"; [key: string]: any };

export type IconProps = {
  name: IconsType;
} & BasicProps;

export type IconCustomProps = {
  name: string;
  src: string;
} & BasicProps &
  BoxProps;

const sizes = {
  small: 16,
  medium: 24,
  large: 40,
};

const IconImpl = ({ size = "medium", name, ...rest }: IconProps) => (
  <Box
    aria-hidden="true"
    component="svg"
    display="inline-flex"
    fill="currentcolor"
    flexShrink="0"
    focusable="false"
    role="presentation"
    style={{ width: sizes[size], height: sizes[size] }}
    {...rest}
  >
    <use href={`/assets/onboarding/sprite.svg#${name}`} />
  </Box>
);

export const Icon = memo(IconImpl);

export const IconCustom = memo<IconCustomProps>(IconImpl as any);
