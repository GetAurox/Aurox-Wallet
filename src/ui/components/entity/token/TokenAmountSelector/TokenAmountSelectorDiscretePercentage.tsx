import { styled, Button, buttonClasses } from "@mui/material";

const TokenAmountSelectorDiscretePercentage = styled(Button)(({ theme }) => ({
  [`&.${buttonClasses.root}`]: {
    flex: 1,
    minWidth: 0,
    padding: 4,
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: 14,
    lineHeight: 24 / 14,
    letterSpacing: "0.1px",
    borderRadius: 4,

    [`&.${buttonClasses.containedInherit}`]: {
      backgroundColor: theme.palette.custom.grey["19"],
    },
  },
}));

export default TokenAmountSelectorDiscretePercentage;
