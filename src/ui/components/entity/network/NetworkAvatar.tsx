import randomColor from "randomcolor";

import { Avatar } from "@mui/material";

import { SupportedNetworkChain } from "ui/types";
import { BlockchainNetwork } from "common/types";
import { NETWORKS_ICONS } from "common/config";

export interface NetworkAvatarProps {
  size?: number;
  network: BlockchainNetwork;
}

export const NetworkAvatar = (props: NetworkAvatarProps) => {
  const { size = 24, network } = props;

  const icon = NETWORKS_ICONS[network.chainId as SupportedNetworkChain] || undefined;

  return (
    <Avatar
      src={icon}
      alt={network.name}
      sx={{
        width: size,
        height: size,
        bgcolor: icon
          ? "transparent"
          : randomColor({
              luminosity: "bright",
              seed: network.name,
            }),
      }}
    >
      {network.name.charAt(0)}
    </Avatar>
  );
};
