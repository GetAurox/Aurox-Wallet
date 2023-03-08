import { Typography, Box, Slider, Theme } from "@mui/material";

const sxStyles = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 0.25,
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
    marginBottom: "25px",
  },
  textBox: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "3px",
  },
  primaryText: {
    fontSize: "14px",
    lineHeight: (theme: Theme) => theme.typography.pxToRem(20),
    letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
    color: "text.secondary",
  },
  secondaryText: {
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
};

export interface NFTTokenInfoAccordionTraitsItemProps {
  primaryText: string;
  secondaryText: string;
  value: number;
}

export default function NFTTokenInfoAccordionTraitsItem(props: NFTTokenInfoAccordionTraitsItemProps) {
  const { primaryText, secondaryText, value } = props;

  return (
    <Box sx={sxStyles.root}>
      <Typography sx={sxStyles.primaryText}>{primaryText}</Typography>
      <Box sx={sxStyles.textBox}>
        <Typography sx={sxStyles.secondaryText}>{secondaryText}</Typography>
        <Typography sx={sxStyles.value}>{value}% have this trait</Typography>
      </Box>
      <Slider aria-label="Background" defaultValue={value} getAriaValueText={value => value.toString()} sx={sxStyles.slider} disabled />
    </Box>
  );
}
