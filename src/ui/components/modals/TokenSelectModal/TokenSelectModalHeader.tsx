import { memo } from "react";

import { Theme, Box, paperClasses, inputBaseClasses, Typography } from "@mui/material";

import SearchField from "ui/components/form/SearchField";

const sxStyles = {
  searchField: {
    inputBase: {
      [`&.${inputBaseClasses.root}`]: {
        py: "3px",
      },
    },
    inputPaper: {
      [`&.${paperClasses.root}`]: {
        borderColor: (theme: Theme) => theme.palette.custom.grey["30"],
        backgroundColor: (theme: Theme) => theme.palette.custom.grey["30"],
      },
    },
  },
};

export interface TokenSelectModalHeaderProps {
  title: string;
  onSearch: (...args: any[]) => void;
}

export default memo(function TokenSelectModalHeader(props: TokenSelectModalHeaderProps) {
  const { title, onSearch } = props;

  return (
    <>
      <Typography variant="headingSmall" align="center">
        {title}
      </Typography>
      <Box width={1} mt="10px">
        <SearchField placeholder="Search" onChange={onSearch} sx={sxStyles.searchField} />
      </Box>
    </>
  );
});
