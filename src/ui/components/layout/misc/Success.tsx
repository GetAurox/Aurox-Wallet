import { memo } from "react";

import { Box, Button, Typography, Theme } from "@mui/material";

import { IconSuccessCheckmark } from "ui/components/icons";

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
    maxWidth: 110,
  },
  primary: {
    mt: 3,
    color: "text.primary",
    fontWeight: 500,
    fontSize: 24,
    lineHeight: (theme: Theme) => theme.typography.pxToRem(32),
    letterSpacing: 0.18,
    textAlign: "center",
  },
  secondary: {
    mt: "5px",
    color: "text.secondary",
    fontSize: 16,
    lineHeight: (theme: Theme) => theme.typography.pxToRem(24),
    letterSpacing: 0.5,
    textAlign: "center",
  },
};

export interface SuccessProps {
  heading?: string;
  subheading?: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  buttonLabel?: string;
}

export default memo(function Success(props: SuccessProps) {
  const {
    heading = "Complete",
    subheading = "Operation was completed successfully.",
    buttonDisabled,
    onButtonClick,
    buttonLabel = "OK",
  } = props;

  return (
    <Box flex={1} display="flex" flexDirection="column" p={2}>
      <Box sx={sxStyles.wrap}>
        <Box sx={sxStyles.logoWrap}>
          <IconSuccessCheckmark />
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
      <Button variant="contained" fullWidth disabled={buttonDisabled} onClick={onButtonClick}>
        {buttonLabel}
      </Button>
    </Box>
  );
});
