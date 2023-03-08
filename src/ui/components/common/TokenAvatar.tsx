import { Avatar, Badge, BadgeOrigin } from "@mui/material";

import randomColor from "randomcolor";

import { NETWORKS_ICONS } from "common/config";
import { getNetworkDefinitionFromIdentifier } from "common/utils";

import { SupportedNetworkChain } from "ui/types";
import { getAvatarAltChar } from "ui/common/utils";

const badgeOrigin: BadgeOrigin = { vertical: "bottom", horizontal: "right" };

const DEFAULT_TOKEN_ICON_SIZE = 32;
const DEFAULT_NETWORK_ICON_SIZE = 18;

export interface TokenAvatarProps {
  networkIdentifier?: string;
  src?: string;
  alt?: string;
  tokenIconSize?: number;
  networkIconSize?: number;
}

export default function TokenAvatar(props: TokenAvatarProps) {
  const { networkIdentifier, src, alt, tokenIconSize, networkIconSize } = props;

  const { chainType = undefined, chainId = undefined } = networkIdentifier ? getNetworkDefinitionFromIdentifier(networkIdentifier) : {};

  const stringColor = alt && chainType ? `${alt} ${chainType}` : "default";

  const tokenIconSxStyles = {
    width: tokenIconSize ?? DEFAULT_TOKEN_ICON_SIZE,
    height: tokenIconSize ?? DEFAULT_TOKEN_ICON_SIZE,
    bgcolor: src
      ? "transparent"
      : randomColor({
          luminosity: "bright",
          seed: stringColor,
        }),
  };

  const networkIconSxStyles = { width: networkIconSize ?? DEFAULT_NETWORK_ICON_SIZE, height: networkIconSize ?? DEFAULT_NETWORK_ICON_SIZE };

  const networkIconSrc = typeof chainId === "number" ? NETWORKS_ICONS[chainId as SupportedNetworkChain] : undefined;

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
      <Avatar sx={tokenIconSxStyles} src={src} alt={alt}>
        {alt && getAvatarAltChar(alt)}
      </Avatar>
    </Badge>
  );
}
