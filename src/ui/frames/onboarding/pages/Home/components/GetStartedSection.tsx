import { useEffect, useRef } from "react";

import { useVideo } from "react-use";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

import { Box, Button, Container, Stack, Typography } from "@mui/material";

import { Dialog, Icon, Image } from "ui/frames/onboarding/components";
import { useOpenable } from "ui/frames/onboarding/libs";

export default function GetStartedSection() {
  const [isPinPopupOpen, handleOpenPinPopup, handleClosePinPopup] = useOpenable();
  const [isEdgeBrowserPinPopupOpen, handleOpenEdgeBrowserPinPopup, handleCloseEdgeBrowserPinPopup] = useOpenable();

  const scrollTargetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollTargetRef, offset: ["end end", "center center"] });

  const scale = useTransform(scrollYProgress, [1, 0.7], [0.7, 1]);
  const spring = useSpring(scale, { stiffness: 50, damping: 10 });

  const [video, , videoControls] = useVideo(
    <Box
      autoPlay={false}
      border="3px solid #060b17"
      component="video"
      height="100%"
      loop
      muted
      playsInline
      preload="auto"
      style={{ objectFit: "cover" }}
      width="100%"
    >
      <source src="https://storage.googleapis.com/aurox-general-access-files/welcome.mov" type="video/mp4" />
      Your browser does not support the video tag.
    </Box>,
  );

  useEffect(() => {
    setTimeout(() => {
      videoControls.play();
    }, 100);
  }, [videoControls]);

  useEffect(() => {
    chrome.action.getUserSettings().then(({ isOnToolbar }) => {
      if (!isOnToolbar) {
        const isEdgeBrowser = /Edg/.test(navigator.userAgent);

        const timeout = setTimeout(isEdgeBrowser ? handleOpenEdgeBrowserPinPopup : handleOpenPinPopup, 2000);

        return () => {
          clearTimeout(timeout);
        };
      }
    });
  }, [handleOpenEdgeBrowserPinPopup, handleOpenPinPopup]);

  return (
    <>
      <Box bgcolor="#060b17" minHeight="100vh" overflow="hidden" position="relative" zIndex={3}>
        <Box
          bottom={0}
          height="101%"
          position="absolute"
          sx={{
            background:
              "radial-gradient(61.25% 70.02% at 50% 10.67%, rgba(6, 11, 23, 0) 0%, rgba(6, 11, 23, 0.42) 30.73%, rgba(6, 11, 23, 0.79) 63.02%, #060B17 100%)",
          }}
          top={0}
          width="100%"
        />
        <motion.div style={{ scale: spring, position: "fixed", width: "100%" }}>
          <Box height="100%" position="absolute" width="100%">
            <Box
              bottom={0}
              position="absolute"
              sx={{
                background:
                  "radial-gradient(50.25% 65.02% at 50% 68.67%, rgba(6, 11, 23, 0) 0%, rgba(6, 11, 23, 0.42) 30.73%, rgba(6, 11, 23, 0.79) 63.02%, #060B17 100%)",
              }}
              top={0}
              width="100%"
            />
            {video}
          </Box>
          <Container>
            <Stack alignItems="center" justifyContent="space-between" minHeight="100vh" position="relative" py={3} textAlign="center">
              <div />
              <Stack
                alignItems="center"
                animate={{ y: 0 }}
                className="container"
                component={motion.div}
                initial={{ y: -100 }}
                position="relative"
                textAlign="center"
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.4,
                }}
              >
                <Typography
                  animate={{ height: "auto" }}
                  component={motion.h1}
                  fontSize={["12vw", "10vw", "8vw", "88px"]}
                  fontWeight={500}
                  initial={{ height: 0 }}
                  letterSpacing="-1px"
                  maxWidth="793px"
                  mb={2}
                  overflow="hidden"
                  transition={{
                    delay: 0.4,
                    duration: 1,
                  }}
                  variant="h900-xl"
                >
                  Meet your favorite crypto wallet
                </Typography>
                <Typography
                  animate={{ height: "auto" }}
                  color="txt300"
                  component={motion.p}
                  fontSize={["4vw", "20px", "20px", "20px"]}
                  initial={{ height: 0 }}
                  maxWidth="572px"
                  mb={4}
                  overflow="hidden"
                  textAlign="center"
                  transition={{
                    delay: 0.4,
                    duration: 1,
                  }}
                  variant="p700-xl"
                >
                  The multi-chain browser wallet designed for safer storage, better security, and smarter insights.{" "}
                </Typography>

                <Box
                  animate={{ height: "auto" }}
                  component={motion.div}
                  overflow="hidden"
                  initial={{ height: 0 }}
                  transition={{
                    delay: 0.4,
                    duration: 1,
                  }}
                >
                  <Box>
                    <Icon name="40px-scroll" size="large" />
                  </Box>
                  <Typography mt="12px" variant="btn50-bs">
                    Scroll down to the bottom of the page to set up your wallet
                  </Typography>
                </Box>
              </Stack>
              <div />
            </Stack>
          </Container>
        </motion.div>
      </Box>
      <div ref={scrollTargetRef} />
      <Dialog.Root open={isPinPopupOpen} onClose={handleClosePinPopup}>
        <Dialog.DialogTitle>Get quick access to your wallet</Dialog.DialogTitle>
        <Dialog.DialogContent style={{ maxWidth: 436 }}>
          <Dialog.DialogContentText color="txt600" mt={1}>
            Be sure to pin the extension in your browser to access it easily.
          </Dialog.DialogContentText>
          <Dialog.DialogContentText mb={2} mt={5}>
            1. Click on <Icon name="48px-puzzle" /> icon in Chrome browser
          </Dialog.DialogContentText>
          <Image alt="" height={96} src="/assets/onboarding/images/extension.png" width={138} />
          <Dialog.DialogContentText mt={2}>
            2. Find Aurox Wallet in the list of extensions and click the
            <Icon name="24px-pin" /> button
          </Dialog.DialogContentText>
          <Image alt="" height={67} src="/assets/onboarding/images/pin.png" width={301} />
        </Dialog.DialogContent>
        <Dialog.DialogActions>
          <Button fullWidth variant="contained" onClick={handleClosePinPopup}>
            Got it
          </Button>
        </Dialog.DialogActions>
      </Dialog.Root>
      <Dialog.Root open={isEdgeBrowserPinPopupOpen} onClose={handleCloseEdgeBrowserPinPopup}>
        <Dialog.DialogTitle>Get quick access to your wallet</Dialog.DialogTitle>
        <Dialog.DialogContent style={{ maxWidth: 436 }}>
          <Dialog.DialogContentText color="txt600" mt={1}>
            Be sure to pin the extension in your browser to access it easily.
          </Dialog.DialogContentText>
          <Dialog.DialogContentText mb={2} mt={5}>
            1. Click on <Icon name="24px-edgeBrowser-puzzle" /> icon in Edge browser
          </Dialog.DialogContentText>
          <Image alt="" height={96} src="/assets/onboarding/images/edgeBrowser-extension.png" width={138} />
          <Dialog.DialogContentText mt={2}>
            2. Find Aurox Wallet in the list of extensions and click the
            <Icon name="24px-edgeBrowser-pin" /> button
          </Dialog.DialogContentText>
          <Image alt="" height={67} src="/assets/onboarding/images/edgeBrowser-pin.png" width={301} />
        </Dialog.DialogContent>
        <Dialog.DialogActions>
          <Button fullWidth variant="contained" onClick={handleCloseEdgeBrowserPinPopup}>
            Got it
          </Button>
        </Dialog.DialogActions>
      </Dialog.Root>
    </>
  );
}
