import { useRef } from "react";

import { Box, Container, Stack } from "@mui/material";
import { useScroll } from "framer-motion";

import { AnimationText } from "./AnimationText";

export const TextSection = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end center"] });

  return (
    <Box id="textSection" minHeight="100vh" overflow="hidden" position="relative" zIndex={5}>
      <Container maxWidth="xl">
        <Stack alignItems="center" justifyContent="center" minHeight="100vh" position="relative" py={8} textAlign="center">
          <Stack ref={ref} className="container" position="relative">
            <AnimationText inputRange={[0.1, 0.4, 1]} scrollYProgress={scrollYProgress}>
              The most powerful
            </AnimationText>
            <AnimationText inputRange={[0.15, 0.5, 1]} scrollYProgress={scrollYProgress}>
              and easy-to-use
            </AnimationText>
            <AnimationText inputRange={[0.2, 0.6, 1]} scrollYProgress={scrollYProgress}>
              Web3 wallet
            </AnimationText>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
