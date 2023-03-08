import { Box, Link, Typography } from "@mui/material";

import CopyableText from "../clipboard/CopyableText";

export type DescriptionItemVariant = "link" | "text" | "copyable";

export interface DescriptionListItemProps {
  label: string;
  value: string;
  variant?: DescriptionItemVariant;
}

export default function DescriptionListItem(props: DescriptionListItemProps) {
  const { label, value, variant = "text" } = props;

  return (
    <Box>
      <Typography variant="medium" component="dt" color="text.secondary">
        {label}
      </Typography>
      {variant === "text" && (
        <Typography variant="large" component="dd">
          {value}
        </Typography>
      )}
      {variant === "link" && (
        <Link underline="none" href={`https://${value}`} target="_blank" rel="noopener noreferrer">
          {value}
        </Link>
      )}
      {variant === "copyable" && <CopyableText component="dd" text={value} disableCollapseIdentifier variant="large" ml={0} />}
    </Box>
  );
}
