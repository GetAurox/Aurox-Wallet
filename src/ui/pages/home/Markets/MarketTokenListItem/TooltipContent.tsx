import { List, ListItem, Typography } from "@mui/material";

import { formatAbbreviated } from "ui/common/utils";

const sxStyles = {
  list: {
    rowGap: 0.5,
    paddingInlineStart: 1,
  },
  listItem: {
    columnGap: 0.5,
  },
};

export interface TooltipContentProps {
  volume: string;
  supply: string;
}

export default function TooltipContent(props: TooltipContentProps) {
  const { volume, supply } = props;

  return (
    <List disablePadding sx={sxStyles.list}>
      <ListItem disablePadding sx={sxStyles.listItem}>
        <Typography variant="medium" mr={0.5} color="text.secondary">
          &#x2022;
        </Typography>
        <Typography variant="medium" color="text.secondary">
          Volume
        </Typography>
        <Typography variant="medium">{formatAbbreviated(volume)}</Typography>
      </ListItem>
      <ListItem disablePadding sx={sxStyles.listItem}>
        <Typography variant="medium" mr={0.5} color="text.secondary">
          &#x2022;
        </Typography>
        <Typography variant="medium" color="text.secondary">
          Supply
        </Typography>
        <Typography variant="medium">{formatAbbreviated(supply)}</Typography>
      </ListItem>
    </List>
  );
}
