import { Link, Stack, Typography } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export interface NetworkCardItemProps {
  label: string;
  value: string;
  link?: boolean;
}

export function NetworkCardItem(props: NetworkCardItemProps) {
  const { label, value, link } = props;

  return (
    <Stack rowGap={0.5}>
      <Typography variant="medium" color="text.secondary">
        {label}
      </Typography>
      {!link && <Typography variant="medium">{value}</Typography>}
      {link && (
        <Link href={value} underline="hover" target="_blank" rel="noopener noreferrer">
          {value}
          <OpenInNewIcon fontSize="small" />
        </Link>
      )}
    </Stack>
  );
}
