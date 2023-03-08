import { keyframes } from "@emotion/react";

import { InputBase, styled } from "@mui/material";

const autofill = keyframes({
  to: {
    color: "inherit",
    background: "transparent",
  },
});

export const Input = styled(InputBase)(({ theme, error }) => ({
  backgroundColor: theme.palette.bg800,
  color: theme.palette.txt100,
  borderRadius: 16,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: theme.palette.outline700,
  transition: theme.transitions.create(["border-color", "background-color", "box-shadow"]),

  "&:hover": {
    backgroundColor: theme.palette.hover200,
    borderColor: theme.palette.hover300,
  },
  "&:focus": {
    borderColor: theme.palette.primary900,
    boxShadow: `0 0 0 1px ${theme.palette.focus100}`,
  },
  "&:disabled ": {
    backgroundColor: theme.palette["content-disabled200"],
    color: theme.palette["content-disabled100"],
    borderColor: "transparent",
  },
  ...(error && {
    borderColor: theme.palette.error100 + "!important",
  }),

  "& .MuiIconButton-root": { color: theme.palette.txt100, marginRight: 0 },
  "& .MuiInputBase-input": {
    position: "relative",
    padding: "12px 16px",
    outline: "none",
    borderRadius: 16,
    ...theme.typography["input-val200-bs"],
    // Use the system font instead of the default Roboto font.
    "&:-webkit-autofill,&:-webkit-autofill:focus,&:-webkit-autofill:hover": {
      "-webkit-text-fill-color": theme.palette.txt100,
      "box-shadow": `0 0 0px 1000px ${theme.palette.bg800} inset`,
      "-webkit-animation-name": autofill,
      "-webkit-animation-fill-mode": "both",
    },
  },
}));
