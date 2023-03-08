import { styled, Slider, sliderClasses } from "@mui/material";

const TokenAmountSelectorCustomPercentage = styled(Slider)(({ theme }) => ({
  [`&.${sliderClasses.root}`]: {
    padding: "9px 0",
    color: theme.palette.text.primary,
  },
  [`& .${sliderClasses.rail}`]: {
    opacity: 1,
  },
  [`& .${sliderClasses.thumb}`]: {
    width: 20,
    height: 20,
    border: `2px solid ${theme.palette.primary.main}`,

    "&::after": {
      width: 24,
      height: 24,
    },
  },
}));

export default TokenAmountSelectorCustomPercentage;
