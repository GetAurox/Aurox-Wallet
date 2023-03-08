import { ReactNode } from "react";
import { Link } from "react-router-dom";

import { Theme } from "@mui/material/styles";

import { Divider, ListItem, ListItemButton, ListItemButtonProps, ListItemIcon, ListItemText, SxProps, Typography } from "@mui/material";

import { mixSx } from "ui/common/utils";

const sxStyles = {
  listItem: {},
  listItemButton: {
    "&.MuiListItemButton-root": {
      px: 0,
      py: 2,
    },
  },
  listItemText: {},
  startIcon: {
    "&.MuiListItemIcon-root": {
      ml: 2,
    },
  },
  endIcon: {
    "&.MuiListItemIcon-root": {
      mr: 1,
    },
  },
};

export interface CommonListItemProps extends Omit<ListItemButtonProps, "sx"> {
  href?: string;
  spacing?: number;
  endIcon?: ReactNode;
  startIcon?: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  dividerVariant?: "fullWidth" | "inset" | "middle";
  sx?: Partial<Record<keyof typeof sxStyles, SxProps<Theme>>>;
}

export default function CommonListItem(props: CommonListItemProps) {
  const { primaryLabel, secondaryLabel, startIcon, endIcon, sx = {}, spacing = 2, divider, dividerVariant, href, ...otherProps } = props;

  let listItemButtonProps: unknown = otherProps;

  if (href) {
    listItemButtonProps = {
      to: href,
      component: Link,
    };
  }

  return (
    <>
      <ListItem disablePadding alignItems="flex-start" sx={sx.listItem}>
        <ListItemButton
          {...(listItemButtonProps as ListItemButtonProps)}
          sx={mixSx(sxStyles.listItemButton, sx.listItemButton, { columnGap: spacing })}
        >
          {startIcon && <ListItemIcon sx={mixSx(sxStyles.startIcon, sx.startIcon)}>{startIcon}</ListItemIcon>}
          <ListItemText
            disableTypography
            sx={sx.listItemText}
            primary={<Typography variant="large">{primaryLabel}</Typography>}
            secondary={
              <Typography display="block" variant="small" color="text.secondary">
                {secondaryLabel}
              </Typography>
            }
          />
          {endIcon && <ListItemIcon sx={mixSx(sxStyles.endIcon, sx.endIcon)}>{endIcon}</ListItemIcon>}
        </ListItemButton>
      </ListItem>
      {divider && <Divider variant={dividerVariant} component="li" />}
    </>
  );
}
