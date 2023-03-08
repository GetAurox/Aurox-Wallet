import { styled, Button, buttonClasses } from "@mui/material";

const ExpandButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  [`&.${buttonClasses.root}`]: {
    padding: 0,
    lineHeight: 20 / 16,
    letterSpacing: "0.25px",
    borderRadius: 0,

    ["&:hover"]: {
      background: "transparent",
    },
  },
  [`& .${buttonClasses.endIcon}`]: {
    marginRight: 0,
    marginLeft: theme.spacing(0.5),
  },
}));

export default ExpandButton;
