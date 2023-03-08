import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { createTheme } from "@mui/material/styles";

import { DEFAULT_POPUP_WIDTH } from "common/manifest";

export const customPalette: Record<string, Record<string, string>> = {
  white: {
    "100": "#fff",
  },
  grey: {
    "5": "#010919",
    "7": "#0b0f17",
    "15": "#1e242e",
    "17": "#212636",
    "19": "#2a2e39",
    "25": "#31404e",
    "30": "#3b4d5e",
    "35": "#3a4f78",
    "50": "#6c8093",
    "60": "#8e99a4",
    "70": "#8e99a4",
    "80": "#c4ccd4",
    "93": "#e1edfa",
    "97": "#f0f7ff",
  },
  blue: {
    "58": "#2c81fc",
  },
  red: {
    "60": "#f24840",
  },
  green: {
    "54": "#54c06e",
  },
  yellow: {
    "50": "#f6c009",
  },
  orange: {
    "50": "#f09055",
  },
};

export const defaultTheme = createTheme({
  typography: {
    small: {
      fontSize: 12,
      lineHeight: 16 / 12,
      letterSpacing: "0.4px",
    },
    medium: {
      fontSize: 14,
      lineHeight: 20 / 14,
      letterSpacing: "0.25px",
    },
    large: {
      fontSize: 16,
      lineHeight: 24 / 16,
      letterSpacing: "0.5px",
    },
    headingSmall: {
      fontSize: 20,
      fontWeight: 500,
      lineHeight: 24 / 20,
      letterSpacing: "0.15px",
    },
    headingMedium: {
      fontSize: 28,
      fontWeight: 500,
      lineHeight: 36 / 28,
      letterSpacing: "0.18px",
    },
  },
  palette: {
    mode: "dark",
    primary: {
      main: customPalette.blue["58"],
    },
    text: {
      primary: customPalette.white["100"],
      secondary: customPalette.grey["60"],
    },
    warning: {
      main: customPalette.yellow["50"],
    },
    error: {
      main: customPalette.red["60"],
    },
    success: {
      main: customPalette.green["54"],
    },
    background: {
      default: customPalette.grey["7"],
      paper: customPalette.grey["17"],
    },
    custom: customPalette,
  },
});

export const theme = createTheme(defaultTheme, {
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          "&[disabled]": {
            color: defaultTheme.palette.action.disabled,
            pointerEvents: "none",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 400,
          textTransform: "none",

          "&.MuiButton-sizeSmall": {
            padding: "4px 8px",
            fontSize: 11,
            lineHeight: 16 / 11,
            borderRadius: 7,
          },

          "&.MuiButton-sizeMedium": {
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 16,
            lineHeight: 24 / 16,
            letterSpacing: "0.15px",
            borderRadius: 12,
          },

          "&.Mui-disabled": {
            color: defaultTheme.palette.custom.grey["50"],
          },

          ".MuiButton-contained.Mui-disabled": {
            backgroundColor: defaultTheme.palette.custom.grey["30"],
          },
          ".MuiButton-outlined.Mui-disabled": {
            borderColor: defaultTheme.palette.custom.grey["30"],
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          padding: "5px 12px",
          fontSize: 16,
          lineHeight: 24 / 16,
          letterSpacing: "0.5px",
          borderRadius: 12,
        },
        input: {
          height: 32,
          padding: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontSize: 14,
          lineHeight: 20 / 14,
          letterSpacing: "0.25px",
          borderRadius: 30,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          height: "100%",
          maxHeight: "100%",
          maxWidth: DEFAULT_POPUP_WIDTH,
          backgroundImage: "none",
          backgroundColor: defaultTheme.palette.background.default,
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: "fit-content",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 16 / 14,
          letterSpacing: "0.25px",
          textTransform: "none",
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        root: {
          margin: 0,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          listStyleType: "none",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: defaultTheme.palette.background.paper,
          padding: "9px 12px 7px",
          borderRadius: 10,
        },
        arrow: {
          color: defaultTheme.palette.background.paper,
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          ".MuiButtonBase-root": {
            "&.Mui-selected": {
              backgroundColor: defaultTheme.palette.primary.main,
            },
            "&:hover": {
              backgroundColor: defaultTheme.palette.text.secondary,
            },
          },
        },
      },
    },
  },
});
