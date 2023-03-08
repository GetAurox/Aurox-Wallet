import { FC, PropsWithChildren, ReactNode } from "react";

import { Box, Container, Stack } from "@mui/material";

import { ProgressRegistration } from "ui/frames/onboarding/components/ProgressRegistration";

const InnerWalletTemplate: FC<PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <Container style={{ maxWidth: "496px" }}>
      <Stack alignItems="center" justifyContent="center" minHeight="100vh" py={4} width="100%">
        <Stack bgcolor="bg850" borderRadius="32px" p={3} width="100%">
          {children}
        </Stack>
        <Box mt={6} width="100%">
          <ProgressRegistration />
        </Box>
      </Stack>
    </Container>
  );
};

interface NewWalletPageLayoutProps {
  page: ReactNode;
}

export function InnerWalletPageLayout({ page }: NewWalletPageLayoutProps) {
  return <InnerWalletTemplate>{page}</InnerWalletTemplate>;
}
