import { Typography, Box, Slider, Theme } from "@mui/material";

const sxStyles = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "19px",
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
    lineHeight: (theme: Theme) => theme.typography.pxToRem(20),
    letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
    color: "text.secondary",
  },
  textBox: {
    display: "flex",
    justifyContent: "space-between",
  },
};

function valuetext(value: number) {
  return `${value}`;
}

export interface NFTTokenInfoAccordionStatsItemProps {
  property: string;
  value: number;
  maxValue: number;
}

export default function NFTTokenInfoAccordionStatsItem(props: NFTTokenInfoAccordionStatsItemProps) {
  const { property, value, maxValue } = props;

  return (
    <Box sx={sxStyles.root}>
      <Box sx={sxStyles.textBox}>
        <Typography sx={sxStyles.header}>{property}</Typography>
        <Typography sx={sxStyles.value}>
          {value} of {maxValue}
        </Typography>
      </Box>

      <Slider aria-label={property} defaultValue={value} getAriaValueText={valuetext} sx={sxStyles.slider} max={maxValue} disabled />
    </Box>
  );
}
