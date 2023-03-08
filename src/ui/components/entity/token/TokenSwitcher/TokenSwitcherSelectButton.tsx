import { styled, Button, buttonClasses } from "@mui/material";

const TokenSwitcherSelectButton = styled(Button)(({ theme }) => ({
  [`&.${buttonClasses.root}`]: {
    minWidth: 124,
    padding: "6px 0",
    justifyContent: "space-between",

    ["&:hover"]: {
      background: "transparent",
    },
  },
  [`& .${buttonClasses.endIcon}`]: {
    marginRight: 0,
    marginLeft: theme.spacing(0.5),
  },
}));

export default TokenSwitcherSelectButton;
