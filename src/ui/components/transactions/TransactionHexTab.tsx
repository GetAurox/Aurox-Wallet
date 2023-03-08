import { Box, Stack, Typography } from "@mui/material";

import { theme } from "ui/common/theme";

const sxStyles = {
  codeBlock: {
    padding: 1,
    border: `1px solid ${theme.palette.custom.grey[19]}`,
    borderRadius: "15px",
    fontSize: 12,
    lineHeight: "16px",
    letterSpacing: "0.4px",
    wordWrap: "break-word",
  },
  method: {
    name: {
      fontWeight: 500,
      fontSize: 16,
      lineHeight: "24px",
      textTransform: "capitalize",
    },
    arguments: {
      color: theme.palette.text.secondary,
      fontWeight: 500,
      fontSize: 16,
      lineHeight: "24px",
    },
  },
};

export interface TransactionHexTabProps {
  signature: string | undefined | null;
  calldata: string;
}

export default function TransactionHexTab(props: TransactionHexTabProps) {
  const { signature, calldata } = props;

  let methodDetails = { name: "call", arguments: "" };

  if (signature) {
    const signatureSplitter = signature.indexOf("(");

    methodDetails = {
      name: signature.slice(0, signatureSplitter),
      arguments: signature.slice(signatureSplitter),
    };
  }

  return (
    <Box m={2}>
      <Stack flexDirection="row">
        <Typography variant="medium" sx={sxStyles.method.name}>
          {methodDetails.name}
        </Typography>
        <Typography variant="medium" sx={sxStyles.method.arguments}>
          {methodDetails.arguments}
        </Typography>
      </Stack>
      <Box sx={sxStyles.codeBlock}>{calldata}</Box>
    </Box>
  );
}
