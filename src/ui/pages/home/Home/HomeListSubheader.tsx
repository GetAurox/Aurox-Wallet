import { useState, ChangeEvent, ReactNode } from "react";

import { Box, Button, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

import useAnalytics from "ui/common/analytics";

import Search from "ui/components/common/Search";
import { IconSearch } from "ui/components/icons";

const sxStyles = {
  buttonSearch: {
    minWidth: "fit-content",
    "& .MuiButton-endIcon": {
      marginLeft: 0,
    },
    "&.MuiButton-sizeMedium": {
      padding: 0,
    },
  },
  buttonSearchClose: {
    padding: 0,
    height: "fit-content",
  },
};

export interface HomeListSubheaderProps {
  title: string;
  icon?: ReactNode;
  sort: ReactNode;
  onSearchClose: () => void;
  onSearch: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export default function HomeListSubheader(props: HomeListSubheaderProps) {
  const { title, sort, onSearch, onSearchClose, icon } = props;

  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  const { trackButtonClicked } = useAnalytics();

  const handleSearchIconClick = () => {
    setIsSearchActive(true);

    trackButtonClicked("My Balances Search");
  };

  const handleSearchClose = () => {
    setIsSearchActive(false);
    onSearchClose?.();
  };

  return (
    <>
      {isSearchActive ? (
        <Box gap={1} px={2} display="flex" marginTop="29px" alignItems="center">
          <Search type="text" fullWidth onChange={onSearch} />
          <IconButton onClick={handleSearchClose} sx={sxStyles.buttonSearchClose}>
            <CloseIcon color="primary" />
          </IconButton>
        </Box>
      ) : (
        <Box px={2} display="flex" marginTop="29px" alignItems="center" justifyContent="space-between">
          <Box display="flex" gap="9px" alignItems="center">
            <Typography fontSize="20px" fontWeight={500} lineHeight="24px" color="text.primary" letterSpacing="0.15px">
              {title}
            </Typography>
            <Button color="primary" variant="text" sx={sxStyles.buttonSearch} endIcon={<IconSearch />} onClick={handleSearchIconClick} />
            {icon}
          </Box>
          <Box display="flex" alignItems="center">
            <Typography color="primary" fontSize="14px" display="inline" lineHeight="20px" letterSpacing="0.25px">
              Sort by:
            </Typography>
            {sort}
          </Box>
        </Box>
      )}
    </>
  );
}
