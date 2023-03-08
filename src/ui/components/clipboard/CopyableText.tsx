import { memo } from "react";

import { BoxProps } from "@mui/system";

import { Box, Typography } from "@mui/material";

import { collapseIdentifier } from "ui/common/utils";

import CopyToClipboard from "./CopyToClipboard";

export interface CopyableTextProps extends BoxProps {
  text: string;
  variant?: "medium" | "large";
  disableCollapseIdentifier?: boolean;
}

export default memo(function CopyableText(props: CopyableTextProps) {
  const { text, disableCollapseIdentifier = false, variant = "medium", ...boxProps } = props;

  return (
    <Box alignItems="center" display="flex" justifyContent="left" gap={0.5} {...boxProps}>
      <Typography variant={variant} color="primary.main">
        {disableCollapseIdentifier ? text : collapseIdentifier(text)}
      </Typography>
      <CopyToClipboard text={text} />
    </Box>
  );
});
