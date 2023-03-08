/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/naming-convention */
import "@mui/material/styles";

type CustomColors =
  | "bg100"
  | "bg600"
  | "bg700"
  | "bg800"
  | "bg850"
  | "bg900"
  | "bg950"
  | "button-disabled200"
  | "content-disabled100"
  | "content-disabled200"
  | "error100"
  | "focus100"
  | "hover100"
  | "hover200"
  | "hover300"
  | "outline100"
  | "outline500"
  | "outline700"
  | "outline800"
  | "pressed100"
  | "pressed200"
  | "primary900"
  | "scn100"
  | "selected200"
  | "selected300"
  | "success100"
  | "txt100"
  | "txt300"
  | "txt600"
  | "txt700"
  | "txt900"
  | "warning100";

type TextStyle =
  | "small"
  | "medium"
  | "large"
  | "headingSmall"
  | "headingMedium"
  | "btn50-bs"
  | "btn100-bs"
  | "btn105-bs"
  | "btn110-bs"
  | "btn200-bs"
  | "btn205-bs"
  | "btn210-bs"
  | "btn300-bs"
  | "btn310-bs"
  | "h200-bs"
  | "h200-sm"
  | "h200-xl"
  | "h300-lg"
  | "h300-sm"
  | "h300-xl"
  | "h400-bs"
  | "h400-lg"
  | "h400-xl"
  | "h500-bs"
  | "h500-lg"
  | "h500-sm"
  | "h500-xl"
  | "h600-bs"
  | "h600-lg"
  | "h600-sm"
  | "h600-xl"
  | "h800-bs"
  | "h800-lg"
  | "h800-sm"
  | "h800-xl"
  | "h900-bs"
  | "h900-lg"
  | "h900-sm"
  | "input-error100-bs"
  | "input-label200-bs"
  | "input-label300-bs"
  | "input-val100-bs"
  | "input-val200-bs"
  | "p400-lg"
  | "p400-xl"
  | "p500-lg"
  | "p500-xl"
  | "p600-bs"
  | "p600-lg"
  | "p600-sm"
  | "p600-xl"
  | "p700-lg"
  | "p700-sm"
  | "p700-xl"
  | "p800-lg"
  | "p800-sm"
  | "p800-xl"
  | "p900-bs"
  | "h1000-xl"
  | "h900-xl";

type CustomPalette = {
  custom: Record<string, Record<string, string>>;
};
type Variants = Record<TextStyle, React.CSSProperties>;
export declare module "@mui/material/styles" {
  interface Theme extends Record<CustomColors, string> {}
  interface Palette extends CustomPalette, Record<CustomColors, string> {}
  interface PaletteOptions extends CustomPalette {}
  interface ThemeOptions extends Partial<Record<CustomColors, string>> {}
  interface TypographyVariants extends Variants {}

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions extends Partial<Variants> {}
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides extends Record<TextStyle, true> {}
}
