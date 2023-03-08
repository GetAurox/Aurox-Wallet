import { styled, Paper, paperClasses } from "@mui/material";

const TokenAmountSelectorSurface = styled(Paper)(({ theme }) => ({
  [`&.${paperClasses.root}`]: {
    padding: "6px 12px",
    borderRadius: "12px",
    background: theme.palette.custom.grey["19"],
  },
}));

export default TokenAmountSelectorSurface;
