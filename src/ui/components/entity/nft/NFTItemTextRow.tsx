import { ReactNode } from "react";

import { Box } from "@mui/material";

export interface NFTItemTextRowProps {
  children: ReactNode;
}

export default function NFTItemTextRow(props: NFTItemTextRowProps) {
  const { children } = props;

  return (
    <Box display="flex" gap={1.5} justifyContent="space-between" alignItems="center">
      {children}
    </Box>
  );
}
