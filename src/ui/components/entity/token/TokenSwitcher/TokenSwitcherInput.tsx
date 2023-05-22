import { styled, InputBase, inputBaseClasses, InputBaseProps } from "@mui/material";

const spinButton = {
  webkitAppearance: "none",
  appearance: "none",
  margin: 0,
};

const StyledInput = styled(InputBase)(({ theme }) => ({
  [`&.${inputBaseClasses.root}`]: {
    flex: 1,
    padding: 0,
    fontWeight: 500,
    letterSpacing: "0.15px",
  },
  [`& .${inputBaseClasses.input}`]: {
    height: "auto",
    "&::-webkit-inner-spin-button": spinButton,
    "&::-webkit-outer-spin-button": spinButton,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "135px",
    "&:focus": {
      width: "124px",
    },
  },
  "&.Mui-error": {
    color: theme.palette.error.main,
  },
}));

export default function TokenSwitcherInput(props: InputBaseProps) {
  return <StyledInput {...props} />;
}
