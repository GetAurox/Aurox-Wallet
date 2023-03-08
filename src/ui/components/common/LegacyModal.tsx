import { memo, ReactNode } from "react";

import { Stack, Box } from "@mui/material";

import { DEFAULT_POPUP_WIDTH } from "common/manifest";

import { usePortal } from "ui/hooks";

export interface LegacyModalProps {
  open: boolean;

  children: ReactNode;
}

export default memo(function LegacyModal(props: LegacyModalProps) {
  const { open, children } = props;

  const Portal = usePortal();

  return (
    <Portal>
      {open ? (
        <Stack
          zIndex={50}
          position="fixed"
          alignItems="center"
          justifyContent="center"
          top={0}
          right={0}
          bottom={0}
          left={0}
          width={1}
          height={1}
          px={2}
          bgcolor="rgba(0,0,0,.5)"
        >
          <Box overflow="auto" width={1} maxHeight={1} bgcolor="background.paper" maxWidth={DEFAULT_POPUP_WIDTH} borderRadius="10px">
            {children}
          </Box>
        </Stack>
      ) : (
        <div />
      )}
    </Portal>
  );
});
