import { FC, PropsWithChildren } from "react";

import { Box, Typography } from "@mui/material";

import { motion, useSpring, useTransform } from "framer-motion";

export const AnimationText: FC<PropsWithChildren<unknown> & { inputRange: number[]; scrollYProgress: any }> = ({
  scrollYProgress,
  children,
  inputRange,
}) => {
  const transformRange = useTransform(scrollYProgress, inputRange, [0, 150, 0]);
  const spring = useSpring(transformRange, { stiffness: 50, damping: 10 });
  const width = useTransform(spring, value => `${value}% 100%`);

  return (
    <Box position="relative">
      <Typography
        color="#ffffff26"
        component={motion.div}
        fontSize={["10vw", "10vw", "10vw", "120px"]}
        maxWidth="12000px"
        style={{
          backgroundSize: width as any,
        }}
        sx={{
          backgroundClip: "text !important",
          background: "linear-gradient(60deg, #fff, #fff)",
          backgroundRepeat: "no-repeat",
        }}
        textAlign="left"
        top={0}
        variant="h1000-xl"
      >
        {children}
      </Typography>
    </Box>
  );
};
