import { useRef } from "react";

import { Box, Container, Stack } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";

import { SignInForm } from "ui/frames/onboarding/pages/SignIn/components/SignInForm";

import { Logo } from "./components/Logo";

export const SignIn = () => {
  const ref = useRef(null);
  const refSignIn = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: [0, 0.5] });
  const { scrollYProgress: scrollYProgressSignIn } = useScroll({
    target: refSignIn,
    offset: ["start start", "start end"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.7], [0.5, 1]);
  const yLogo = useTransform(scrollYProgress, [0, 0.7], [-50, 0]);
  const heightLogo = useTransform(scrollYProgressSignIn, [0.4, 1], [40, 100]);
  const opacityEye = useTransform(scrollYProgress, [0.2, 0.8], [0, 1]);
  const heightTransformedLogo = useTransform(heightLogo, value => `${value}vh`);

  return (
    <Box
      ref={ref}
      minHeight="250vh"
      mt="-100vh"
      position="relative"
      sx={{
        backgroundColor: "#060b17",
        backgroundImage: "radial-gradient(46.63% 51.85% at 50% 0%, #111b35 0%, rgba(6, 11, 23, 0) 100%)",
      }}
      zIndex={3}
    >
      <Stack justifyContent="space-between" maxWidth={1200} minHeight="inherit" mx="auto" p={3}>
        <motion.div
          style={{
            width: "100%",
            minHeight: "inherit",
            scale,
            y: yLogo,
          }}
        >
          <Logo
            opacityEye={opacityEye}
            style={{
              width: "100%",
              top: "30px",
              left: 0,
              maxHeight: "100%",
              maxWidth: "100%",
              height: heightTransformedLogo,
              position: "sticky",
            }}
          />
        </motion.div>
        <Container ref={refSignIn} style={{ maxWidth: "496px" }}>
          <Stack alignItems="center" justifyContent="center" mt={-4} py={4} width="100%">
            <SignInForm />
          </Stack>
        </Container>
      </Stack>
    </Box>
  );
};
