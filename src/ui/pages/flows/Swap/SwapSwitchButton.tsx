import { styled, Button, buttonClasses } from "@mui/material";

const SwapSwitchButton = styled(Button)({
  [`&.${buttonClasses.root}`]: {
    minWidth: 0,
    padding: 2,
    borderRadius: 8,
  },
});

export default SwapSwitchButton;
