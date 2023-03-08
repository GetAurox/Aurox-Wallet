import { useCallback } from "react";

import { Box, Button, Grid, Link as MuiLink, Stack, Typography } from "@mui/material";

import { PasswordField } from "ui/frames/onboarding/components/PasswordField";
import { TextField } from "ui/frames/onboarding/components/TextField";

export function SignInForm() {
  const onSubmit = useCallback(() => {}, []);

  return (
    <Box width="100%">
      <Typography component="h2" textAlign="center" variant="h400-xl">
        Get started with Aurox
      </Typography>
      <Typography color="txt600" component="p" mb={4} mt={1} textAlign="center" variant="p400-xl">
        Enter your credentials to access your account
      </Typography>

      <Button fullWidth LinkComponent="a" variant="contained">
        import / create wallet
      </Button>

      <Stack alignItems="center" direction="row" justifyContent="space-between" mt={4}>
        <Box bgcolor="bg850" component="span" height="1px" width="100%" />
        <Box px={3}>
          <Typography component="span" variant="p400-xl">
            OR
          </Typography>
        </Box>
        <Box bgcolor="bg850" component="span" height="1px" width="100%" />
      </Stack>

      <Box component="form" mt={4}>
        <Grid container gap={2}>
          <TextField fullWidth name="email" placeholder="Email" type="email" />
          <PasswordField fullWidth name="password" placeholder="Password" />
          <Typography color="error100" component="p" minHeight="48px" textAlign="center" variant="input-label200-bs"></Typography>
          <Button fullWidth type="submit" variant="outlined">
            Log in
          </Button>

          <MuiLink underline="hover" variant="p400-xl">
            Forgot password
          </MuiLink>
        </Grid>
      </Box>
    </Box>
  );
}
