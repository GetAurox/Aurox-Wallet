import { Container, Stack } from "@mui/material";

import { SignInForm } from "./components/SignInForm";

export function SignInPage() {
  return (
    <Container style={{ maxWidth: "496px" }}>
      <Stack alignItems="center" justifyContent="center" minHeight="100vh" width="100%">
        <SignInForm />
      </Stack>
    </Container>
  );
}
