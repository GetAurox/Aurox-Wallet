import { useEffect, useRef } from "react";
import { useVideo } from "react-use";
import { Box } from "@mui/material";
import { motion, useScroll, useTransform } from "framer-motion";

export const PlayReel = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "start end"] });
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.5]);
  const [videoMuted, , videoControlsMuted] = useVideo(
    <Box autoPlay={false} component="video" height="100%" loop muted playsInline preload="auto" style={{ objectFit: "cover" }} width="100%">
      <source src="https://storage.googleapis.com/aurox-general-access-files/Aurox Reel.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </Box>,
  );

  useEffect(() => {
    setTimeout(() => {
      videoControlsMuted.play();
    }, 100);
  }, [videoControlsMuted]);

  return (
    <Box ref={ref} minHeight="100vh" overflow="hidden" position="relative" zIndex={5}>
      <motion.div style={{ scale, position: "absolute", minHeight: "100vh", width: "100%", height: "100%" }}>{videoMuted}</motion.div>
    </Box>
  );
};
