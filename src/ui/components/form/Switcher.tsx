import { Theme, Switch, SwitchProps, switchClasses } from "@mui/material";

const sxStyles = {
  width: 51,
  height: 31,
  padding: 0,

  [`& .${switchClasses.switchBase}`]: {
    padding: 0,
    margin: "2px 0 0 0",
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: (theme: Theme) => theme.palette.text.primary,
      [`& + .${switchClasses.track}`]: {
        backgroundColor: (theme: Theme) => theme.palette.custom.green["54"],
        opacity: 1,
        border: 0,
      },
      [`&.Mui-disabled + .${switchClasses.track}`]: {
        opacity: 0.5,
      },
    },
    [`&.Mui-focusVisible .${switchClasses.thumb}`]: {
      color: "#33cf4d",
      border: (theme: Theme) => `6px solid ${theme.palette.text.primary}`,
    },
    [`&.Mui-disabled .${switchClasses.thumb}`]: {
      color: (theme: Theme) => theme.palette.custom.grey["60"],
    },
    [`&.Mui-disabled + .${switchClasses.track}`]: {
      opacity: () => 0.3,
    },
  },
  [`& .${switchClasses.thumb}`]: {
    boxSizing: "border-box",
    width: 27,
    height: 27,
  },
  [`& .${switchClasses.track}`]: {
    borderRadius: 31 / 2,
    backgroundColor: (theme: Theme) => theme.palette.custom.white["100"],
    opacity: 1,
    transition: (theme: Theme) =>
      theme.transitions.create(["background-color"], {
        duration: 500,
      }),
  },
};

export default function Switcher(props: SwitchProps) {
  return <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple sx={sxStyles} {...props} />;
}
