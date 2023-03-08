import { ComponentType } from "react";

import { styled } from "@mui/material";

import { IconArrowDownIOS } from "ui/components/icons";

export interface IconExpandMoreProps {
  expand: boolean;
  Icon?: ComponentType<any>;
}

const IconExpandMore = styled((props: IconExpandMoreProps) => {
  const { expand, Icon = IconArrowDownIOS, ...other } = props;

  return <Icon {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default IconExpandMore;
