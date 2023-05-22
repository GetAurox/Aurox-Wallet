import { ReactNode } from "react";

import { Typography, Theme, Stack, Button, CircularProgress } from "@mui/material";

import FixedPanel from "ui/components/layout/misc/FixedPanel";

const sxStyles = {
  primary: {
    mt: 3,
    color: "text.primary",
    fontWeight: 500,
    fontSize: 24,
    lineHeight: (theme: Theme) => theme.typography.pxToRem(32),
    letterSpacing: "0.18px",
    textAlign: "center",
  },
  progress: {
    color: (theme: Theme) => theme.palette.text.primary,
  },
};

export interface PendingViewProps {
  heading?: ReactNode;
  subheading?: ReactNode;
  buttonDisabled?: boolean;
  onButtonClick?: () => void;
  buttonLabel?: string;
  children?: ReactNode;
}

export default function PendingView(props: PendingViewProps) {
  const { heading, subheading, buttonDisabled, onButtonClick, buttonLabel = "OK", children } = props;

  return (
    <>
      <Stack flexGrow={1} rowGap={1} mx={1.75} justifyContent="center" alignItems="center">
        {heading && (
          <Typography component="p" variant="inherit" sx={sxStyles.primary}>
            {heading}
          </Typography>
        )}

        <CircularProgress size={44} sx={sxStyles.progress} />

        {subheading && (
          <Typography mt="3px" mx={5.125} whiteSpace="break-spaces" textAlign="center" component="p" variant="large" color="text.secondary">
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
