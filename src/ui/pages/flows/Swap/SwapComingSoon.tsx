import { Stack, Typography } from "@mui/material";

import { useHistoryGoBack } from "ui/common/history";

import Header from "ui/components/layout/misc/Header";

export default function SwapComingSoon() {
  const goBack = useHistoryGoBack();

  return (
    <>
      <Header title="Swap" onBackClick={goBack} />
      <Stack mx={2} flex={1} justifyContent="center">
        <Typography variant="headingSmall" textAlign="center">
          Gasless swapping is being finished & will be available soon.
        </Typography>
      </Stack>
    </>
  );
}
