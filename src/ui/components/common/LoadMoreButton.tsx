import { memo } from "react";

import { Box, Button } from "@mui/material";

export interface LoadMoreButtonProps {
  onClick: () => void;
}

export default memo(function LoadMoreButton(props: LoadMoreButtonProps) {
  const { onClick } = props;

  return (
    <Box mx={2} my={1.25}>
      <Button variant="contained" fullWidth onClick={onClick}>
        Load more
      </Button>
    </Box>
  );
});
