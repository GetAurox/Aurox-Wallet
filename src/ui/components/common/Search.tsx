import { Theme, InputAdornment, OutlinedInput, OutlinedInputProps } from "@mui/material";

import { Search as SearchIcon } from "@mui/icons-material";

import { mixSx } from "ui/common/utils";

const sxOutlinedInput = {
  py: 0,
  border: "none",
  borderRadius: "16px",
  backgroundColor: (theme: Theme) => theme.palette.custom.grey["19"],
  "& .MuiOutlinedInput-input": {
    py: "8px",
    height: "24px",
    fontWeight: 400,
    fontSize: "1rem",
    lineHeight: "24px",
    letterSpacing: "0.5px",
    color: "text.secondary",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderWidth: 0,
  },
};

export type SearchProps = Omit<OutlinedInputProps, "placeholder">;

export default function Search(props: SearchProps) {
  const { sx, type = "search", ...rest } = props;

  return (
    <OutlinedInput
      type={type}
      placeholder="Search"
      sx={mixSx(sxOutlinedInput, sx)}
      startAdornment={
        <InputAdornment position="start">
          <SearchIcon fontSize="small" />
        </InputAdornment>
      }
      {...rest}
    />
  );
}
