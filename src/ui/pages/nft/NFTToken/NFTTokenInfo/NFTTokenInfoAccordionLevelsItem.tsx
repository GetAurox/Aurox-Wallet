import { format } from "util";

import { Typography, Box, Slider, Theme } from "@mui/material";

const sxStyles = {
  root: {
    gap: "5px",
    display: "flex",
    marginBottom: "19px",
    flexDirection: "column",
  },
  slider: {
    color: (theme: Theme) => theme.palette.success.main,
    "& .MuiSlider-track": {
      color: (theme: Theme) => theme.palette.success.main,
    },
    "& .MuiSlider-rail": {
      color: (theme: Theme) => theme.palette.success.main,
    },
    "& .MuiSlider-thumb": {
      display: "none",
    },
    padding: 0,
  },
  header: {
    fontSize: "16px",
    lineHeight: (theme: Theme) => theme.typography.pxToRem(24),
    letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.5),
  },
  value: {
    fontSize: "12px",
    color: "text.secondary",
    lineHeight: (theme: Theme) => theme.typography.pxToRem(20),
    letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
  },
  textBox: {
    display: "flex",
    justifyContent: "space-between",
  },
};

export interface NFTTokenInfoAccordionLevelsItemProps {
  property: string;
  value: number;
  maxValue: number;
}

export default function NFTTokenInfoAccordionLevelsItem(props: NFTTokenInfoAccordionLevelsItemProps) {
  const { property, value, maxValue } = props;

  const maximumValue = maxValue > 1000 ? format(maxValue) : maxValue;

  return (
    <Box sx={sxStyles.root}>
      <Box sx={sxStyles.textBox}>
        <Typography sx={sxStyles.header}>{property}</Typography>
        <Typography sx={sxStyles.value}>
          {value} of {maximumValue}
        </Typography>
      </Box>

      <Slider
        disabled
        max={maxValue}
        defaultValue={value}
        sx={sxStyles.slider}
        aria-label={property}
        getAriaValueText={value => value.toString()}
      />
    </Box>
  );
}
