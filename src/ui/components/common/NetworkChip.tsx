import { ReactNode } from "react";
import clsx from "clsx";

import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";

import { Chip, ChipProps } from "@mui/material";

import { SupportedNetworkChain } from "ui/types";

import { NETWORKS_ICONS } from "common/config";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    "&.MuiChip-root": {
      color: theme.palette.text.primary,
      backgroundColor: theme.palette.custom.grey["30"],

      "&.Mui-disabled": {
        opacity: 0.7,
        color: "#51585f",
        backgroundColor: theme.palette.custom.grey["19"],
      },
    },
  },
  icon: {
    width: 20,
  },
}));

export interface NetworkChipProps extends ChipProps {
  chainId: SupportedNetworkChain;
  rootClassName?: string;
}

export default function NetworkChip(props: NetworkChipProps) {
  const { chainId, rootClassName, ...rest } = props;

  const classes = useStyles();

  let icon: ReactNode | undefined = undefined;

  if (NETWORKS_ICONS[chainId]) {
    icon = <img src={NETWORKS_ICONS[chainId]} className={classes.icon} />;
  }

  return <Chip className={clsx(classes.root, rootClassName)} icon={icon} {...rest} />;
}
