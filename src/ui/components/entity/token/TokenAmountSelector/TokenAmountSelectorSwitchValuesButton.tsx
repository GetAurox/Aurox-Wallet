import { styled, Button, buttonClasses } from "@mui/material";

const TokenAmountSelectorSwitchValuesButton = styled(Button)({
  [`&.${buttonClasses.root}`]: {
    minWidth: 24,
    padding: 0,
    borderRadius: 0,
  },
});

export default TokenAmountSelectorSwitchValuesButton;
