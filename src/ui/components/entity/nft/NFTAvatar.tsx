import { ReactNode } from "react";

import { Avatar, ListItemAvatar, SxProps, Theme } from "@mui/material";

const sxAvatar = {
  width: 72,
  height: 72,
  borderRadius: 2.5,
  marginRight: 1.5,
};

export interface NFTAvatarProps {
  src?: string;
  alt?: string;
  styles?: SxProps<Theme>;
  children?: ReactNode;
}

export default function NFTAvatar(props: NFTAvatarProps) {
  const { src, alt, styles, children } = props;

  return (
    <ListItemAvatar>
      <Avatar src={src} alt={alt} variant="rounded" sx={styles ? { ...sxAvatar, ...styles } : sxAvatar}>
        {children}
      </Avatar>
    </ListItemAvatar>
  );
}
