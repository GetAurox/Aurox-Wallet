import { styled, ToggleButton, toggleButtonClasses } from "@mui/material";

const FeeToggleButton = styled(ToggleButton)(({ theme }) => ({
  [`&.${toggleButtonClasses.root}`]: {
    minWidth: 60,
    padding: "4px 10px",
    border: "none",
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 16 / 11,
    letterSpacing: 0,
    textTransform: "none",
    borderRadius: 7,

    "&.Mui-selected": {
      color: theme.palette.text.primary,
      background: theme.palette.primary.main,
    },
  },
}));

export default FeeToggleButton;
