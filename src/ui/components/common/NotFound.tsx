import { Stack, StackProps } from "@mui/material";

import { IconNotFound } from "ui/components/icons";

type NotFoundProps = StackProps;

export default function NotFound(props: NotFoundProps) {
  const { alignItems = "center", justifyContent = "center", ...otherProps } = props;

  return (
    <Stack alignItems={alignItems} justifyContent={justifyContent} {...otherProps}>
      <IconNotFound />
    </Stack>
  );
}
