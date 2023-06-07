import { ReactNode } from "react";

import { Typography, Theme, Stack, Box, Button } from "@mui/material";

import { IconFail } from "ui/components/icons";

import FixedPanel from "./FixedPanel";

const sxStyles = {
  primary: {
    mt: 3,
    color: "text.primary",
    fontWeight: 500,
    fontSize: 24,
    lineHeight: (theme: Theme) => theme.typography.pxToRem(32),
    letterSpacing: 0.18,
    textAlign: "center",
  },
  logo: {
    display: "grid",
    placeItems: "center",
  },
};

export interface FailViewProps {
  heading?: string;
  subheading?: string;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  buttonLabel?: string;
  children?: ReactNode;
}

export default function FailView(props: FailViewProps) {
  const {
    heading = "Failed",
    subheading = "Operation was not completed successfully.",
    buttonDisabled,
    onButtonClick,
    buttonLabel = "OK",
    children,
  } = props;

  return (
    <>
      <Stack flexGrow={1} rowGap={1} mx={1.5} justifyContent="center" alignItems="center">
        <Box mb={2} sx={sxStyles.logo}>
          <IconFail />
        </Box>

        {heading && (
          <Typography component="p" variant="inherit" sx={sxStyles.primary}>
            {heading}
          </Typography>
        )}

        {subheading && (
          <Typography mx={4.75} whiteSpace="break-spaces" textAlign="center" component="p" variant="large" color="text.secondary">
            {subheading}
          </Typography>
        )}
        {children}
      </Stack>
      {onButtonClick && (
        <FixedPanel p={2} disablePortal variant="bottom">
          <Button variant="contained" fullWidth onClick={onButtonClick} disabled={buttonDisabled}>
            {buttonLabel}
          </Button>
        </FixedPanel>
      )}
    </>
  );
}
