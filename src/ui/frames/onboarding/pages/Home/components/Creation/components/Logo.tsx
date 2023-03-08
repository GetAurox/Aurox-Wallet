import { motion, MotionStyle } from "framer-motion";
import { Stack } from "@mui/material";

export interface LogoProps {
  style?: MotionStyle;
}

export const Logo = (props: LogoProps) => {
  const { style } = props;

  return (
    <motion.div style={style}>
      <Stack direction="row" height="inherit" justifyContent="center" mx="auto">
        <img alt="" src="/assets/onboarding/images/aurox-logo.png" style={{ maxWidth: "100%", objectFit: "contain" }} />
      </Stack>
    </motion.div>
  );
};
