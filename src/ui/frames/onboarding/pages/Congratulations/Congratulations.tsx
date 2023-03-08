import { Button, Container, Stack, Typography } from "@mui/material";

import { AUROX_TUTORIALS_PAGE_URL } from "common/config";

import { Image } from "../../components/Image";

export default function Congratulations() {
  const handleNavigate = () => {
    window.location.href = AUROX_TUTORIALS_PAGE_URL;
  };

  return (
    <Container>
      <Stack alignItems="center" justifyContent="center" minHeight="100vh" position="relative" textAlign="center">
        <Image alt="Aurox" height={358} layout="intrinsic" src="/assets/onboarding/images/aurox-logo.png" width={540} />
        <Typography component="h1" fontWeight={500} letterSpacing="-1px" maxWidth="793px" mb={2} variant="h500-xl">
          Your wallet is already created!
        </Typography>
        <Typography color="txt600" maxWidth="493px" mb={4} variant="p600-xl">
          You’ve already completed the steps to set up your wallet. If you need help, please click the button below.
        </Typography>
        <Button variant="contained" onClick={handleNavigate}>
          Learn More
        </Button>
      </Stack>
    </Container>
  );
}
