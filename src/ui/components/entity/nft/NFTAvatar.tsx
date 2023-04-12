import { ReactNode } from "react";

import { Avatar, Badge, BadgeOrigin, SxProps, Theme } from "@mui/material";

import { getNetworkDefinitionFromIdentifier } from "common/utils";
import { NETWORKS_ICONS } from "common/config";

import { SupportedNetworkChain } from "ui/types";

const badgeOrigin: BadgeOrigin = { vertical: "bottom", horizontal: "right" };

const DEFAULT_NETWORK_ICON_SIZE = 18;

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
  networkIdentifier?: string;
  networkIconSize?: number;
}

export default function NFTAvatar(props: NFTAvatarProps) {
  const { src, alt, styles, children, networkIdentifier, networkIconSize } = props;

  const { chainType = undefined, chainId = undefined } = networkIdentifier ? getNetworkDefinitionFromIdentifier(networkIdentifier) : {};

  const networkIconSrc = typeof chainId === "number" ? NETWORKS_ICONS[chainId as SupportedNetworkChain] : undefined;

  const networkIconSxStyles = {
    width: networkIconSize ?? DEFAULT_NETWORK_ICON_SIZE,
    height: networkIconSize ?? DEFAULT_NETWORK_ICON_SIZE,
  };

  return (
    <Badge
      overlap="circular"
      anchorOrigin={badgeOrigin}
      invisible={!networkIconSrc}
      badgeContent={
        <Avatar src={networkIconSrc} alt={chainType} sx={networkIconSxStyles}>
          {chainType?.charAt(0)}
        </Avatar>
      }
    >
      <Avatar src={src} alt={alt} variant="rounded" sx={styles ? { ...sxAvatar, ...styles } : sxAvatar}>
        {children}
      </Avatar>
    </Badge>
  );
}
