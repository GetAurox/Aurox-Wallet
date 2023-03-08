import { styled, InputBase, inputBaseClasses, InputBaseProps } from "@mui/material";

const StyledInput = styled(InputBase)(({ theme }) => ({
  [`&.${inputBaseClasses.root}`]: {
    padding: 0,
  },
  "&.Mui-error": {
    color: theme.palette.error.main,
  },
}));

export default function TokenSwitcherInput(props: InputBaseProps) {
  return (
    <StyledInput
      sx={{
        [`&.${inputBaseClasses.root}`]: {
          fontWeight: 500,
          letterSpacing: "0.15px",
        },
        [`& .${inputBaseClasses.input}`]: {
          height: "auto",
        },
      }}
      {...props}
    />
  );
}
