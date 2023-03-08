const borderRadius = {
  sm: "2px",
  DEFAULT: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  "2xl": "16px",
  large: "24px",
  full: "9999px",
};

const borderWidth = {
  DEFAULT: "1px",
  0: "0",
  2: "2px",
  4: "4px",
  8: "8px",
};

const spacing = {
  0: "0px",
  "1px": "1px",
  "4px": "4px",
  1: "8px",
  "12px": "12px",
  2: "16px",
  3: "24px",
  4: "32px",
  5: "40px",
  6: "48px",
  7: "56px",
  8: "64px",
  9: "72px",
  10: "80px",
  11: "88px",
  12: "96px",
  13: "104px",
  14: "112px",
  15: "120px",
  16: "128px",
  17: "136px",
  18: "144px",
  19: "152px",
  20: "160px",
  21: "168px",
  22: "176px",
  23: "184px",
  24: "192px",
  25: "200px",
  "safe-t": "env(safe-area-inset-top)",
  "safe-b": "env(safe-area-inset-bottom)",
};

const minWidth = ({ theme }) => ({
  ...theme("width"),
  modal: "700px",
  content: "800px",
});

const maxWidth = ({ theme }) => ({
  ...theme("minWidth"),
});

const minHeight = ({ theme }) => ({
  ...theme("height"),
});

const maxHeight = ({ theme }) => ({
  ...theme("minHeight"),
});

module.exports = {
  borderRadius,
  borderWidth,
  maxWidth,
  maxHeight,
  minHeight,
  minWidth,
  spacing,
};
