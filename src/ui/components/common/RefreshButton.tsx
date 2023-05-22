import { memo, useState } from "react";

import { Refresh as RefreshIcon } from "@mui/icons-material";
import { IconButton } from "@mui/material";

export interface RefreshButtonProps {
  onClick: () => void;
}

export default memo(function RefreshButton(props: RefreshButtonProps) {
  const { onClick } = props;

  const [refreshing, setRefreshing] = useState(false);

  const handleClick = () => {
    setRefreshing(true);

    onClick();

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <IconButton sx={{ padding: 0 }} disabled={refreshing} onClick={handleClick}>
      <RefreshIcon />
    </IconButton>
  );
});
