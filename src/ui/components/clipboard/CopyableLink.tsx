import { Box, BoxProps, Link, LinkProps, Typography } from "@mui/material";

import { collapseIdentifier } from "ui/common/utils";

import CopyToClipboard from "./CopyToClipboard";

const sxStyles = {
  link: {
    fontSize: "14px",
    lineHeight: "20px",
    letterSpacing: "0.25px",
  },
};

export interface CopyableLinkProps extends BoxProps {
  text: string;
  link: string | null;
  linkProps?: LinkProps;
  disableCollapseIdentifier?: boolean;
}

export default function CopyableLink(props: CopyableLinkProps) {
  const { link, text, disableCollapseIdentifier, linkProps, ...boxProps } = props;

  const displayText = disableCollapseIdentifier ? text : collapseIdentifier(text);

  return (
    <Box alignItems="center" display="flex" justifyContent="right" gap={0.5} {...boxProps}>
      {link && (
        <Link href={link} target="_blank" color="primary" sx={sxStyles.link} {...linkProps}>
          {displayText}
        </Link>
      )}
      {!link && (
        <Typography variant="medium" color="primary">
          {displayText}
        </Typography>
      )}
      <CopyToClipboard text={text} />
    </Box>
  );
}
