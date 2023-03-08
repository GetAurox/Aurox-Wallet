import { useRef } from "react";

import { motion, useScroll, useTransform } from "framer-motion";

import { Box, Stack } from "@mui/material";

import { CreateWallet } from "./components/CreateWallet";
import { InfoCard } from "./components/InfoCard";
import { Logo } from "./components/Logo";

export const Creation = () => {
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
      <Stack justifyContent="space-between" maxWidth={1400} minHeight="inherit" mx="auto" p={3}>
        <motion.div
          style={{
            width: "100%",
            minHeight: "inherit",
            scale,
            y: yLogo,
          }}
        >
          <Logo
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
        <Stack ref={refSignIn} id="createWallet" justifyContent="center" minHeight="100vh" py={4} width="100%">
          <Stack direction={["column", null, null, "row"]} gap="96px" justifyContent="space-between" width="100%">
            <Stack spacing={2}>
              <InfoCard
                description="Advanced security features protect you from every major type of scam and hack"
                image="/assets/onboarding/images/security.png"
                title="Security"
              />
              <InfoCard
                description="Easy to use wallet with powerful analytics to keep you up-to-date about your portfolio"
                image="/assets/onboarding/images/simple-yet.png"
                title="Simple yet powerful"
              />

              <InfoCard
                description="Utilize our gas-less trading to avoid high network transaction costs"
                image="/assets/onboarding/images/low-fees.png"
                title="Low fees"
              />
            </Stack>
            <CreateWallet />
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
