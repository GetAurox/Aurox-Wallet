import { createTheme } from "@mui/material/styles";

const colors = require("./colors");
const { textVariants } = require("./text-styles");

// Create a theme instance.
export const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...textVariants["v-btn210-bs"],
          borderRadius: "16px",
          padding: "12px 24px",
          letterSpacing: "1px",
          ...(ownerState.variant === "contained" &&
            ownerState.color === "primary" && {
              backgroundColor: colors.primary900,
              color: colors.txt100,
              "&:hover": {
                backgroundColor: colors.hover100,
              },
              "&:focus": {
                backgroundColor: colors.pressed100,
              },
              "&:disabled": {
                backgroundColor: colors["button-disabled200"],
                color: colors["content-disabled100"],
              },
            }),
          ...(ownerState.variant === "outlined" &&
            ownerState.color === "primary" && {
              borderWidth: "2px !important",
            }),
          ...(ownerState.size === "medium" && { height: "48px" }),
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          backgroundColor: colors.bg850,
          color: colors.txt100,
          borderRadius: theme.spacing(3),
        }),
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(6),
        }),
      },
    },
    MuiDialogContentText: {
      defaultProps: { color: "inherit" },
    },
    MuiDialogActions: {
      styleOverrides: {
        spacing: ({ theme }) => ({
          padding: theme.spacing(6),
          paddingTop: theme.spacing(1),
        }),
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(6),
          paddingBottom: theme.spacing(1),
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          padding: "16px",
          borderRadius: "16px",
          ...textVariants["input-label200-bs"],
          ...(ownerState.severity === "warning" && {
            color: colors.warning100,
            backgroundColor: "rgba(255, 184, 119, 0.2)",
          }),
          "& .MuiAlert-icon": {
            color: colors.warning100,
          },
        }),
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          "& svg": {
            ...(ownerState.severity === "warning" && {
              // borderRadius: '8px',
              color: colors.warning100,
            }),
          },
        }),
      },
    },
    MuiTypography: {
      defaultProps: {
        variantMapping: Object.entries(textVariants).reduce((acc, [key]) => {
          return { ...acc, [key]: "p" };
        }, {}),
      },
    },
  },
  typography: {
    ...textVariants,
    fontFamily: [
      "Manrope",
      "Arial",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  palette: {
    ...colors,
    primary: {
      main: colors.primary900,
    },
    info: { main: colors.txt100, "200": colors.txt600 },
    warning: { main: colors.warning100 },
    secondary: {
      main: colors.txt600,
    },
  },
});
