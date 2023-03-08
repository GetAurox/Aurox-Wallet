import { PropsWithChildren } from "react";

import { Box, Typography } from "@mui/material";

export function FieldError({ children }: PropsWithChildren<unknown>) {
  return (
    <Box bgcolor="bg800" border="1px solid" borderColor="error100" borderRadius="36px" bottom="-8px" left="16px" position="absolute" px={1}>
      <Typography
        color="error100"
        display="block"
        height="16px"
        lineHeight="1.1"
        sx={{
          "&::first-letter": {
            textTransform: "uppercase",
          },
        }}
        variant="input-error100-bs"
      >
        {children}
      </Typography>
    </Box>
  );
}
