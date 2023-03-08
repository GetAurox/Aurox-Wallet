import { Box, Typography, Theme } from "@mui/material";

import { IconLogo } from "ui/components/icons";

const sxStyles = {
  wrap: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 240,
    maxHeight: 130,
  },
  primary: {
    mt: 2.5,
    color: "text.primary",
    fontWeight: 500,
    fontSize: 24,
    lineHeight: (theme: Theme) => theme.typography.pxToRem(32),
    letterSpacing: 0.18,
  },
  secondary: {
    mt: "11px",
    color: "text.secondary",
    fontSize: 16,
    lineHeight: (theme: Theme) => theme.typography.pxToRem(24),
    letterSpacing: 0.15,
  },
};

export interface SplashLogoProps {
  heading?: string;
  subheading?: string;
}

export default function SplashLogo(props: SplashLogoProps) {
  const { heading, subheading } = props;

  return (
    <Box sx={sxStyles.wrap} className="dark-gradient-bg">
      <Box sx={sxStyles.logoWrap}>
        <IconLogo />
      </Box>

      {heading && (
        <Typography component="p" variant="inherit" sx={sxStyles.primary}>
          {heading}
        </Typography>
      )}

      {subheading && (
        <Typography component="p" variant="inherit" sx={sxStyles.secondary}>
          {subheading}
        </Typography>
      )}
    </Box>
  );
}
