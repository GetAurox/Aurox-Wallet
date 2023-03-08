import { styled, InputBase, inputBaseClasses, InputBaseProps } from "@mui/material";

const spinButton = {
  webkitAppearance: "none",
  appearance: "none",
  margin: 0,
};

const StyledInput = styled(InputBase)(({ theme }) => ({
  [`&.${inputBaseClasses.root}`]: {
    padding: 0,
  },
  [`& .${inputBaseClasses.input}`]: {
    "&::-webkit-inner-spin-button": spinButton,
    "&::-webkit-outer-spin-button": spinButton,
  },
  "&.Mui-error": {
    color: theme.palette.error.main,
  },
}));

export default function TokenAmountSelectorInput(props: InputBaseProps) {
  return <StyledInput sx={{ [`&.${inputBaseClasses.root}`]: { flex: 1 } }} {...props} />;
}
