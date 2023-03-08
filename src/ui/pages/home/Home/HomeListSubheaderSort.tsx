import { Button, styled, Theme } from "@mui/material";
import React from "react";

import { SortSetting } from "ui/types";

import { IconArrowDown } from "ui/components/icons";

const sxStyles = {
  buttonSort: {
    padding: 0,
    fontSize: "14px",
    minWidth: "50px",
    textTransform: "capitalize",
    lineHeight: (theme: Theme) => theme.typography.pxToRem(20),
    letterSpacing: (theme: Theme) => theme.typography.pxToRem(0.25),
    "& .MuiButton-endIcon": {
      marginLeft: "4px",
    },
  },
};

interface ArrowDownIconProps {
  rotate: boolean;
}

const ArrowDownIcon = styled(({ rotate, ...other }: ArrowDownIconProps) => {
  return <IconArrowDown {...other} />;
})(({ rotate }) => ({
  transform: !rotate ? "rotate(0deg)" : "rotate(180deg)",
}));

export interface HomeListSubheaderSortProps {
  sort: SortSetting;
  onSort: (sort: SortSetting) => void;
}

export default function HomeListSubheaderSort(props: HomeListSubheaderSortProps) {
  const { sort, onSort } = props;

  const handleSortDirToggle = () => {
    onSort({ ...sort, dir: sort.dir === "asc" ? "desc" : "asc" });
  };

  return (
    <Button
      variant="text"
      color="primary"
      onClick={handleSortDirToggle}
      sx={sxStyles.buttonSort}
      endIcon={<ArrowDownIcon rotate={sort.dir === "asc"} />}
    >
      {sort.prop}
    </Button>
  );
}
