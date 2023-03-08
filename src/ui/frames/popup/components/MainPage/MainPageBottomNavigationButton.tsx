import { ReactNode } from "react";
import clsx from "clsx";

import { makeStyles } from "@mui/styles";

import { Typography, Theme } from "@mui/material";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    justifyContent: "space-between",
    width: 72,
    paddingTop: 8,
    paddingBottom: 8,
    color: theme.palette.text.secondary,
    textAlign: "center",
    textDecoration: "none",
  },
  active: {
    color: theme.palette.primary.main,
  },
  text: {
    fontSize: 10,
    fontWeight: 400,
    lineHeight: 16 / 10,
    letterSpacing: "0.4px",
  },
}));

export interface MainPageBottomNavigationButtonProps {
  text: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  activeIcon?: ReactNode;
}

export default function MainPageBottomNavigationButton(props: MainPageBottomNavigationButtonProps) {
  const { onClick, active, icon, text, activeIcon } = props;

  const classes = useStyles();

  return (
    <a onClick={onClick} href="#" className={clsx(classes.root, { [classes.active]: active })}>
      {active && activeIcon ? activeIcon : icon}
      <Typography component="span" className={classes.text}>
        {text}
      </Typography>
    </a>
  );
}
