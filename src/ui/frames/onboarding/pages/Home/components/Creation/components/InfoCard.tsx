import { Box, Stack, Typography } from "@mui/material";

import { Image } from "ui/frames/onboarding/components/Image";

export interface InfoCardProps {
  title: string;
  description: string;
  image: string;
}

export const InfoCard = (props: InfoCardProps) => {
  const { title, description, image } = props;

  return (
    <Stack alignItems="center" direction="row" gap="32px" position="relative">
      <Box width={[1 / 3, "auto"]}>
        <Image alt={title} height={245} layout="intrinsic" src={image} width={235} />
      </Box>
      <Box maxWidth={243}>
        <Typography component="h4" variant="h300-xl">
          {title}
        </Typography>
        <Typography color="txt600" mt={1} variant="p400-xl">
          {description}
        </Typography>
      </Box>
    </Stack>
  );
};
