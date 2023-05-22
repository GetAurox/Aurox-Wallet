import { styled, Button, buttonClasses } from "@mui/material";

const TokenSwitcherSwitchValuesButton = styled(Button)({
  [`&.${buttonClasses.root}`]: {
    minWidth: 24,
    marginLeft: "auto",
    padding: 0,
    borderRadius: 0,
  },
});

export default TokenSwitcherSwitchValuesButton;
